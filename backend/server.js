require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { encrypt, decrypt } = require('./utils/crypto');
const cron = require('node-cron');
const path = require('path');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// --- CONFIG VARIABLES ---
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; 
const UID = process.env.FORTYTWO_CLIENT_ID;
const SECRET = process.env.FORTYTWO_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || "secret_par_defaut_a_changer";
const REDIRECT_URI = `${FRONTEND_URL}/auth/42/callback`;

// --- CONSTANTES METIER ---
const MAX_QUOTA = 30;
const VISIBILITY_MAX = 2.0;
const VISIBILITY_LOSS = 0.025; 
const VISIBILITY_GAIN = 0.0625;

const MAX_BIO_LENGTH = 300;

// --- UTILS AGE ---
const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

// Helper Shuffle
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- CRON JOB : MAINTENANCE QUOTIDIENNE ---
cron.schedule('0 0 * * *', async () => {
    console.log('🌙 Daily Maintenance: Reset Quotas & Decay Visibility');
    
    // 1. Reset Quotas pour tout le monde
    await prisma.user.updateMany({
        data: { dailyQuota: MAX_QUOTA }
    });

    // 2. Perte de visibilité globale (Decay)
    await prisma.$executeRaw`UPDATE "User" SET "visibilityScore" = GREATEST(0, "visibilityScore" - ${VISIBILITY_LOSS})`;
});

// --- CONFIG SOCKET.IO & CORS ---
const io = new Server(server, {
    cors: {
        origin: FRONTEND_URL,
        credentials: true
    }
});

app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// --- MIDDLEWARES ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const requireAdmin = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user || !user.isAdmin) {
            return res.sendStatus(403);
        }
        next();
    } catch (e) {
        res.sendStatus(500);
    }
};

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return next(new Error("Authentication error"));
        socket.user = user;
        next();
    });
});

const notifyMatchesOfStatus = async (userId, isOnline) => {
    try {
        const matches = await prisma.match.findMany({
            where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
            select: { user1Id: true, user2Id: true }
        });
        matches.forEach(m => {
            const partnerId = m.user1Id === userId ? m.user2Id : m.user1Id;
            io.to(partnerId).emit('user_status', { userId, isOnline });
        });
    } catch (e) {
        console.error("Error notifying status:", e);
    }
};

// --- LOGIQUE DE CONNEXION / ACTIVITÉ QUOTIDIENNE ---
const handleUserActivity = async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const today = new Date();
    const lastActive = new Date(user.lastActive);
    
    const isNewDay = today.getDate() !== lastActive.getDate() || 
                     today.getMonth() !== lastActive.getMonth() || 
                     today.getFullYear() !== lastActive.getFullYear();

    if (isNewDay) {
        let newScore = user.visibilityScore;
        if (newScore < 0.5) newScore = 0.5;
        newScore = Math.min(VISIBILITY_MAX, newScore + VISIBILITY_GAIN);

        await prisma.user.update({
            where: { id: userId },
            data: {
                lastActive: today,
                visibilityScore: newScore,
                dailyQuota: MAX_QUOTA 
            }
        });
        console.log(`✨ Bonus Activité pour ${user.login}: Score ${newScore.toFixed(3)}`);
    } else {
        await prisma.user.update({ where: { id: userId }, data: { lastActive: today } });
    }
};

io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.user.login} (${socket.id})`);
    
    handleUserActivity(socket.user.id);

    socket.join(socket.user.id);
    notifyMatchesOfStatus(socket.user.id, true);

    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.user.login}`);
        const room = io.sockets.adapter.rooms.get(socket.user.id);
        if (!room || room.size === 0) {
            notifyMatchesOfStatus(socket.user.id, false);
        }
    });
});

// --- ROUTES AUTH ---
app.get('/auth/42', (req, res) => {
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=${UID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    res.redirect(url);
});

app.get('/auth/42/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect(`${FRONTEND_URL}?error=no_code`);

    try {
        const tokenResponse = await axios.post('https://api.intra.42.fr/oauth/token', {
            grant_type: 'authorization_code',
            client_id: UID,
            client_secret: SECRET,
            code: code,
            redirect_uri: REDIRECT_URI,
        });

        const accessToken = tokenResponse.data.access_token;
        const userResponse = await axios.get('https://api.intra.42.fr/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const intraData = userResponse.data;
        const userPhoto = intraData.image?.link || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

        const today = new Date();
        const defaultBirthDate = new Date(today.setFullYear(today.getFullYear() - 18));

        const user = await prisma.user.upsert({
            where: { intraId: intraData.id },
            update: { intraPhoto: userPhoto, updatedAt: new Date() },
            create: {
                intraId: intraData.id,
                email: intraData.email,
                login: intraData.login,
                name: intraData.displayname || intraData.login,
                birthDate: defaultBirthDate,
                ageMin: 18,
                ageMax: 23,
                intraPhoto: userPhoto,
                isOnboarded: false,
                visibilityScore: 1.0, 
                dailyQuota: MAX_QUOTA 
            },
        });

        if (user.isBanned) {
            console.log(`🚫 Tentative de connexion bloquée pour l'utilisateur banni : ${user.login}`);
            return res.redirect(`${FRONTEND_URL}?error=banned`);
        }

        const sessionToken = jwt.sign({ id: user.id, login: user.login }, JWT_SECRET, { expiresIn: '7d' });
        const minimalPayload = { token: sessionToken, isOnboarded: user.isOnboarded, id: user.id };
        const dataString = encodeURIComponent(JSON.stringify(minimalPayload));
        res.redirect(`${FRONTEND_URL}?loginData=${dataString}`);

    } catch (error) {
        console.error("Auth Error", error);
        res.redirect(`${FRONTEND_URL}?error=auth_failed`);
    }
});

// --- API ROUTES ---

const formatUserForFront = (u) => ({
    ...u,
    age: calculateAge(u.birthDate),
    intraLogin: u.login,
    isOnline: io.sockets.adapter.rooms.has(u.id), 
    isAdmin: u.isAdmin || false,
    isBanned: u.isBanned || false,
    dailyQuota: u.dailyQuota, 
    visibilityScore: u.visibilityScore, 
    photos: [u.intraPhoto, ...u.customPhotos],
    discoverySettings: {
        ageRange: [u.ageMin, u.ageMax],
        genderPreference: u.genderPref
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        const { email, message } = req.body;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        let userId = null;

        // Tentative d'identification optionnelle
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.id;
            } catch (e) {
                // Token invalide ou expiré, on ignore et on enregistre en anonyme
            }
        }

        if (!email || !message) {
            return res.status(400).json({ error: "Email and message are required" });
        }

        await prisma.contactMessage.create({
            data: {
                email,
                message,
                userId
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Contact Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.sendStatus(404);
        if (user.isBanned) return res.sendStatus(403);
        res.json(formatUserForFront(user));
    } catch (error) { res.sendStatus(500); }
});

app.put('/api/me', authenticateToken, async (req, res) => {
    try {
        const { bio, gender, intent, discoverySettings, isOnboarded, customPhotos, birthDate } = req.body;

        if (bio && bio.length > MAX_BIO_LENGTH) {
            console.log(`⚠️ Tentative de bypass bio length détectée pour ${req.user.login}`);
            return res.status(400).json({ error: `La bio ne doit pas dépasser ${MAX_BIO_LENGTH} caractères.` });
        }
        
        const updateData = {
            bio, gender, intent, isOnboarded, customPhotos,
            genderPref: discoverySettings?.genderPreference,
            ageMin: discoverySettings?.ageRange ? discoverySettings.ageRange[0] : undefined,
            ageMax: discoverySettings?.ageRange ? discoverySettings.ageRange[1] : undefined,
        };

        if (birthDate) {
            const dateObj = new Date(birthDate);
            updateData.birthDate = dateObj;
            const newAge = calculateAge(dateObj);
            const newMin = Math.max(18, newAge - 5);
            const newMax = newAge + 5;

            if (!discoverySettings?.ageRange) {
                updateData.ageMin = newMin;
                updateData.ageMax = newMax;
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
        });
        res.json(formatUserForFront(updatedUser));
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: "Update failed" }); 
    }
});

app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const myId = req.user.id;
        
        const me = await prisma.user.findUnique({ 
            where: { id: myId },
            select: { genderPref: true, ageMin: true, ageMax: true }
        });

        const today = new Date();
        const minBirthDate = new Date(today.getFullYear() - (me.ageMax + 1), today.getMonth(), today.getDate());
        const maxBirthDate = new Date(today.getFullYear() - me.ageMin, today.getMonth(), today.getDate());

        let genderFilter = {};
        if (me.genderPref === 'MALE') genderFilter = { gender: 'MALE' };
        else if (me.genderPref === 'WOMEN') genderFilter = { gender: 'FEMALE' };
        else if (me.genderPref === 'FEMALE') genderFilter = { gender: 'FEMALE' }; 

        const candidates = await prisma.user.findMany({
            where: {
                NOT: { id: myId },
                isOnboarded: true,
                ...genderFilter,
                birthDate: { gte: minBirthDate, lte: maxBirthDate },
                receivedLikes: { none: { fromId: myId } },
                blocks: { none: { blockedId: myId } },
                blockedBy: { none: { blockerId: myId } }
            },
            select: { id: true, visibilityScore: true } 
        });

        const candidatesWithLuck = candidates.map(c => ({
            id: c.id,
            luck: Math.random() * c.visibilityScore 
        }));

        candidatesWithLuck.sort((a, b) => b.luck - a.luck);

        const selectedIds = candidatesWithLuck.slice(0, 5).map(c => c.id);

        const finalUsers = await prisma.user.findMany({
            where: { id: { in: selectedIds } }
        });

        const formattedUsers = finalUsers.map(formatUserForFront);
        const orderedUsers = selectedIds.map(id => formattedUsers.find(u => u.id === id)).filter(Boolean);

        res.json(orderedUsers);

    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: "Server error" }); 
    }
});

app.get('/api/matches', authenticateToken, async (req, res) => {
    try {
        const myId = req.user.id;
        const matches = await prisma.match.findMany({
            where: { 
                OR: [{ user1Id: myId }, { user2Id: myId }],
                user1: { blocks: { none: { blockedId: myId } }, blockedBy: { none: { blockerId: myId } } },
                user2: { blocks: { none: { blockedId: myId } }, blockedBy: { none: { blockerId: myId } } }
            },
            include: { user1: true, user2: true, messages: { orderBy: { createdAt: 'desc' }, take: 20 } },
            orderBy: { createdAt: 'desc' }
        });

        const formattedMatches = matches.map(m => {
            const otherUserRaw = m.user1Id === myId ? m.user2 : m.user1;
            const otherUser = formatUserForFront(otherUserRaw);
            
            const seenByMe = m.user1Id === myId ? m.user1Seen : m.user2Seen;
            const unreadCount = m.messages.filter(msg => msg.senderId !== myId && !msg.read).length;
            let lastMessage = "Start chatting!";
            if (m.messages.length > 0) {
                try { lastMessage = decrypt(m.messages[0].content); } catch (e) { lastMessage = "🔒 Encrypted message"; }
            }
            return {
                id: m.id,
                timestamp: m.messages.length > 0 ? new Date(m.messages[0].createdAt).getTime() : new Date(m.createdAt).getTime(),
                unreadCount: unreadCount,
                lastMessage: lastMessage,
                isSeen: seenByMe,
                user: otherUser
            };
        });
        formattedMatches.sort((a, b) => b.timestamp - a.timestamp);
        res.json(formattedMatches);
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

app.get('/api/matches/:id/messages', authenticateToken, async (req, res) => {
    try {
        const matchId = req.params.id;
        const myId = req.user.id;
        const messages = await prisma.message.findMany({ where: { matchId: matchId }, orderBy: { createdAt: 'asc' } });
        await prisma.message.updateMany({ where: { matchId: matchId, senderId: { not: myId }, read: false }, data: { read: true } });
        const formattedMessages = messages.map(msg => {
            try { return { id: msg.id, senderId: msg.senderId === myId ? 'me' : msg.senderId, text: decrypt(msg.content), timestamp: new Date(msg.createdAt).getTime() }; }
            catch (e) { return { id: msg.id, senderId: msg.senderId === myId ? 'me' : msg.senderId, text: "⚠️ Message illisible", timestamp: new Date(msg.createdAt).getTime() }; }
        });
        res.json(formattedMessages);
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

app.post('/api/matches/:id/messages', authenticateToken, async (req, res) => {
    try {
        const matchId = req.params.id;
        const { text } = req.body;
        const myId = req.user.id;
        if (!text) return res.status(400).json({ error: "Empty message" });
        const encryptedContent = encrypt(text);
        const newMessage = await prisma.message.create({ data: { content: encryptedContent, senderId: myId, matchId: matchId, read: false } });
        const match = await prisma.match.findUnique({ where: { id: matchId } });
        const receiverId = match.user1Id === myId ? match.user2Id : match.user1Id;
        io.to(receiverId).emit('message', { matchId: matchId, text: text, senderId: myId, id: newMessage.id, timestamp: Date.now() });
        res.json({ success: true, messageId: newMessage.id });
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

app.post('/api/matches/:id/seen', authenticateToken, async (req, res) => {
    try {
        const matchId = req.params.id;
        const myId = req.user.id;
        const match = await prisma.match.findUnique({ where: { id: matchId } });
        if (!match) return res.status(404).json({ error: "Match not found" });
        const updateData = {};
        if (match.user1Id === myId) updateData.user1Seen = true;
        else if (match.user2Id === myId) updateData.user2Seen = true;
        await prisma.match.update({ where: { id: matchId }, data: updateData });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

app.post('/api/swipe', authenticateToken, async (req, res) => {
    const { targetId, action } = req.body;
    const myId = req.user.id;
    if (!targetId || !['LIKE', 'PASS'].includes(action)) return res.status(400).json({ error: "Invalid action" });
    try {
        const me = await prisma.user.findUnique({ where: { id: myId } });
        if (me.dailyQuota <= 0) {
            return res.status(403).json({ error: "Quota exceeded", dailyQuota: 0 });
        }

        await prisma.user.update({
            where: { id: myId },
            data: { dailyQuota: me.dailyQuota - 1 }
        });

        const existingInteraction = await prisma.like.findUnique({ where: { fromId_toId: { fromId: myId, toId: targetId } } });
        if (!existingInteraction) { await prisma.like.create({ data: { fromId: myId, toId: targetId, type: action } }); }
        
        if (action === 'LIKE') {
            const reciprocalLike = await prisma.like.findFirst({ where: { fromId: targetId, toId: myId, type: 'LIKE' } });
            if (reciprocalLike) {
                const existingMatch = await prisma.match.findFirst({ where: { OR: [{ user1Id: myId, user2Id: targetId }, { user1Id: targetId, user2Id: myId }] } });
                if (!existingMatch) {
                    const newMatch = await prisma.match.create({ data: { user1Id: myId, user2Id: targetId, user1Seen: false, user2Seen: false }, include: { user1: true, user2: true } });
                    io.to(targetId).emit('match', { matchId: newMatch.id, partnerId: myId });
                    return res.json({ success: true, isMatch: true, matchData: newMatch, dailyQuota: me.dailyQuota - 1 });
                }
            }
        }
        res.json({ success: true, isMatch: false, dailyQuota: me.dailyQuota - 1 });
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

app.post('/api/users/:id/block', authenticateToken, async (req, res) => {
    try {
        const targetId = req.params.id;
        const myId = req.user.id;
        await prisma.block.create({ data: { blockerId: myId, blockedId: targetId } });
        res.json({ success: true });
    } catch (error) { res.json({ success: true }); }
});

app.post('/api/users/:id/report', authenticateToken, async (req, res) => {
    try {
        const targetId = req.params.id;
        const myId = req.user.id;
        const { reason } = req.body;
        await prisma.report.create({ data: { reporterId: myId, reportedId: targetId, reason: reason || "No reason" } });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

// --- ADMIN ROUTES ---

app.post('/api/admin/ban/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // --- MODIFICATION : SOFT BAN AU LIEU DE DELETE ---
        
        // 1. Marquer comme banni en DB
        await prisma.user.update({ 
            where: { id: userId }, 
            data: { isBanned: true } 
        });

        // 2. Éjecter l'utilisateur en temps réel (Force Disconnect Socket)
        // On récupère toutes les sockets connectées à la room de l'user (userId)
        const sockets = await io.in(userId).fetchSockets();
        if (sockets.length > 0) {
            sockets.forEach(socket => {
                socket.emit('force_logout'); // Le front devra écouter cet event (optionnel)
                socket.disconnect(true);
            });
            console.log(`🔨 User ${userId} kicked via Socket.`);
        }

        res.json({ success: true });
        // -------------------------------------------------

    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: "Cannot ban user" }); 
    }
});

// 1. Récupérer les rapports (MODIFIÉ : Filtre processed: false)
app.get('/api/admin/reports', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
            where: { processed: false }, // <--- AJOUT DU FILTRE
            include: {
                reporter: { select: { id: true, name: true, login: true } },
                reported: { select: { id: true, name: true, login: true, intraPhoto: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

// NOUVEAU : Approuver un rapport (Marquer comme traité)
app.put('/api/admin/reports/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await prisma.report.update({
            where: { id: req.params.id },
            data: { processed: true }
        });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error" }); }
});

// 2. Récupérer les messages de contact (NOUVEAU)
app.get('/api/admin/contacts', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const messages = await prisma.contactMessage.findMany({
            where: { processed: false }, // <--- AJOUT : Seulement les non-traités
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { login: true, intraPhoto: true } } }
        });
        res.json(messages);
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

// NOUVEAU : Marquer un message comme traité
app.put('/api/admin/contacts/:id/process', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await prisma.contactMessage.update({
            where: { id: req.params.id },
            data: { processed: true }
        });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error" }); }
});

// 3. Rechercher des utilisateurs avec infos détaillées (NOUVEAU)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { login: { contains: q, mode: 'insensitive' } },
                    { name: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } }
                ]
            },
            include: {
                _count: { select: { reportedBy: true } } 
            },
            take: 20
        });
        
        // ON FORMATE CORRECTEMENT POUR AVOIR LE CHAMP 'PHOTOS'
        const formattedUsers = users.map(u => ({
            ...formatUserForFront(u),
            _count: u._count // On garde le count spécifique admin
        }));

        res.json(formattedUsers);
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

// 4. Toggle Ban (Amélioration de l'ancien route ban)
app.post('/api/admin/users/:userId/toggle-ban', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // On récupère l'état actuel
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const newStatus = !user.isBanned;

        // Mise à jour DB
        await prisma.user.update({ 
            where: { id: userId }, 
            data: { isBanned: newStatus } 
        });

        // Si on bannit, on kick (Socket)
        if (newStatus) {
            const sockets = await io.in(userId).fetchSockets();
            sockets.forEach(s => {
                s.emit('force_logout');
                s.disconnect(true);
            });
        }

        res.json({ success: true, isBanned: newStatus });
    } catch (error) { res.status(500).json({ error: "Cannot toggle ban" }); }
});

// 5. Supprimer un report (Traité) (Inchangé)
app.delete('/api/admin/reports/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await prisma.report.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error" }); }
});

// 6. Initier un chat admin avec un utilisateur (Force Match)
app.post('/api/admin/users/:userId/chat', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const targetId = req.params.userId;
        const myId = req.user.id;

        // Vérifier si un match existe déjà
        let match = await prisma.match.findFirst({
            where: {
                OR: [
                    { user1Id: myId, user2Id: targetId },
                    { user1Id: targetId, user2Id: myId }
                ]
            },
            include: { user1: true, user2: true, messages: { take: 1, orderBy: { createdAt: 'desc' } } }
        });

        // Si pas de match, on le crée de force (et on force le "Seen" pour pas avoir de notif "Nouveau Match")
        if (!match) {
            match = await prisma.match.create({
                data: {
                    user1Id: myId,
                    user2Id: targetId,
                    user1Seen: true,
                    user2Seen: true
                },
                include: { user1: true, user2: true, messages: { take: 1 } }
            });
        }

        // On formate la réponse pour que le front puisse l'utiliser directement comme un objet "Match"
        const otherUserRaw = match.user1Id === myId ? match.user2 : match.user1;
        const formattedMatch = {
            id: match.id,
            timestamp: match.messages.length > 0 ? new Date(match.messages[0].createdAt).getTime() : new Date(match.createdAt).getTime(),
            unreadCount: 0,
            lastMessage: match.messages.length > 0 ? (match.messages[0].content.startsWith('{"iv":') ? "🔒 Message" : match.messages[0].content) : "Admin Chat started",
            user: formatUserForFront(otherUserRaw) // On réutilise le formateur existant
        };

        res.json(formattedMatch);

    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: "Cannot start chat" }); 
    }
});



// --- DEPLOIEMENT : SERVIR LE FRONTEND ---
// Dit à Express de servir les fichiers statiques générés par Vite
app.use(express.static(path.join(__dirname, '../dist')));

// Redirige toutes les autres requêtes vers l'index.html de React (important pour le router)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});


server.listen(PORT, () => { console.log(`✅ Backend lancé sur http://localhost:${PORT}`); });