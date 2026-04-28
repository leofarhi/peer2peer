// backend/debug/simulate_socket.js
require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');

const prisma = new PrismaClient();
const login = process.argv[2];

if (!login) {
    console.error("❌ Usage : node debug/simulate_socket.js <login>");
    process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET || "secret_par_defaut_a_changer";
const SERVER_URL = "http://localhost:3000";

async function main() {
    try {
        console.log(`🔍 Recherche de l'utilisateur ${login}...`);
        
        // 1. Récupérer l'user pour avoir son ID
        const user = await prisma.user.findUnique({ where: { login: login } });

        if (!user) {
            throw new Error(`Utilisateur introuvable : ${login}`);
        }

        console.log(`✅ Utilisateur trouvé : ${user.name} (${user.id})`);

        // 2. Générer un Token JWT valide (Comme si on s'était connecté via l'API)
        // Le serveur attend { id, login } dans le payload
        const token = jwt.sign(
            { id: user.id, login: user.login },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log(`🔑 Token généré. Tentative de connexion Socket.io...`);

        // 3. Connexion Socket.io
        const socket = io(SERVER_URL, {
            auth: { token }, // On passe le token pour le middleware du serveur
            transports: ['websocket']
        });

        // --- LISTENERS ---

        socket.on('connect', () => {
            console.log(`\n🟢 [CONNECTED] Socket ouvert avec succès !`);
            console.log(`   👉 ID Socket : ${socket.id}`);
            console.log(`   👉 Status : ONLINE (Les autres utilisateurs devraient voir la pastille verte)`);
            console.log(`   ⏳ En attente... (Appuie sur Ctrl+C pour déconnecter)\n`);
        });

        socket.on('connect_error', (err) => {
            console.error(`🔴 [ERROR] Connexion refusée : ${err.message}`);
            process.exit(1);
        });

        socket.on('disconnect', () => {
            console.log(`🔴 [DISCONNECTED] Le serveur a coupé la connexion.`);
        });

        // Écouter les messages reçus
        socket.on('message', (data) => {
            console.log(`📩 [MESSAGE REÇU] De ${data.senderId} : "${data.text}"`);
        });

        // Écouter les changements de statut des amis (si implémenté)
        socket.on('user_status', (data) => {
            console.log(`👀 [STATUS UPDATE] User ${data.userId} est maintenant ${data.isOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`);
        });

        // Écouter les matchs
        socket.on('match', (data) => {
            console.log(`💖 [NOUVEAU MATCH] Avec l'utilisateur ID : ${data.partnerId}`);
        });

    } catch (e) {
        console.error("❌ Erreur :", e.message);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();

// Gestion propre de l'arrêt via Ctrl+C
process.on('SIGINT', async () => {
    console.log("\n🛑 Arrêt demandé via Ctrl+C.");
    await prisma.$disconnect();
    process.exit(0);
});