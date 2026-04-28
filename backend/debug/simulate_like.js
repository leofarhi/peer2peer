// backend/debug/simulate_like.js
require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Récupération des arguments
const senderLogin = process.argv[2];
const receiverLogin = process.argv[3];

if (!senderLogin || !receiverLogin) {
    console.error("❌ Erreur : Il faut fournir deux logins.");
    console.log("Usage : node debug/simulate_like.js <login_qui_like> <login_aimé>");
    process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET || "secret_par_defaut_a_changer";
const API_URL = "http://localhost:3000/api";

async function main() {
    try {
        // 1. Récupérer les infos des utilisateurs (Besoin des ID pour l'API)
        const sender = await prisma.user.findUnique({ where: { login: senderLogin } });
        const receiver = await prisma.user.findUnique({ where: { login: receiverLogin } });

        if (!sender) throw new Error(`Utilisateur introuvable : ${senderLogin}`);
        if (!receiver) throw new Error(`Utilisateur introuvable : ${receiverLogin}`);

        console.log(`🔍 ${sender.name} (${senderLogin}) va liker ${receiver.name} (${receiverLogin}) via l'API...`);

        // 2. Générer un Token JWT pour l'expéditeur (simulation de connexion)
        const token = jwt.sign(
            { id: sender.id, login: sender.login },
            JWT_SECRET,
            { expiresIn: '1m' }
        );

        // 3. Appeler l'API Swipe
        // C'est ici que la magie opère : le serveur va recevoir la requête,
        // traiter le like, vérifier le match et envoyer le SOCKET si besoin.
        const response = await axios.post(
            `${API_URL}/swipe`,
            { 
                targetId: receiver.id, 
                action: 'LIKE' 
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = response.data;

        if (result.isMatch) {
            console.log(`🎉 BOOM ! C'est un MATCH ! (Socket envoyé)`);
            console.log(`💕 ${sender.name} et ${receiver.name} peuvent maintenant discuter.`);
        } else {
            console.log(`✅ Like envoyé avec succès.`);
            console.log(`⏳ En attente que ${receiver.name} like en retour.`);
        }

    } catch (e) {
        console.error("❌ Erreur :", e.response?.data || e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();