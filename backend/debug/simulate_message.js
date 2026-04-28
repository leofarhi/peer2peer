// backend/debug/simulate_message.js
require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const axios = require('axios'); // On utilise axios pour appeler notre propre API
const jwt = require('jsonwebtoken'); // Pour générer un faux token de session

const prisma = new PrismaClient();

const senderLogin = process.argv[2];
const receiverLogin = process.argv[3];
const messageText = process.argv[4];

if (!senderLogin || !receiverLogin || !messageText) {
    console.error("❌ Usage : node debug/simulate_message.js <login_envoyeur> <login_receveur> \"Ton message\"");
    process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET || "secret_par_defaut_a_changer";
const API_URL = "http://localhost:3000/api"; // Ton serveur local

async function main() {
    try {
        // 1. Trouver les utilisateurs (Juste pour vérifier qu'ils existent et avoir les ID)
        const sender = await prisma.user.findUnique({ where: { login: senderLogin } });
        const receiver = await prisma.user.findUnique({ where: { login: receiverLogin } });

        if (!sender) throw new Error(`Expéditeur introuvable : ${senderLogin}`);
        if (!receiver) throw new Error(`Destinataire introuvable : ${receiverLogin}`);

        // 2. Trouver le Match ID (Nécessaire pour l'URL de l'API)
        const match = await prisma.match.findFirst({
            where: {
                OR: [
                    { user1Id: sender.id, user2Id: receiver.id },
                    { user1Id: receiver.id, user2Id: sender.id }
                ]
            }
        });

        if (!match) {
            throw new Error(`Pas de match entre ${senderLogin} et ${receiverLogin}.`);
        }

        console.log(`🔍 Préparation de l'envoi via API...`);

        // 3. Générer un Token JWT temporaire pour l'expéditeur
        // Cela permet de se faire passer pour "sender" auprès de l'API
        const token = jwt.sign(
            { id: sender.id, login: sender.login },
            JWT_SECRET,
            { expiresIn: '1m' }
        );

        // 4. Appeler l'API (C'est ça qui va déclencher le Socket.io !)
        // On envoie le texte en clair, l'API s'occupera du chiffrement
        await axios.post(
            `${API_URL}/matches/${match.id}/messages`,
            { text: messageText },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`✅ Message envoyé via l'API !`);
        console.log(`📡 Le socket devrait être reçu par le frontend instantanément.`);

    } catch (e) {
        console.error("❌ Erreur :", e.response?.data || e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();