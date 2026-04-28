// backend/prisma/seed.js
require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// --- CONFIGURATION ---
const DUMP_FILE = 'debug/users_42_dump.json'; // Doit être à la racine de backend/ ou dans prisma/
const INTENTS = ['LTS', 'COFFEE', 'OPEN_SOURCE', 'SIDE_PROJECT', 'RUSH'];
const GENDER_PREFS = ['MEN', 'WOMEN', 'ALL']; // Aligné avec types.ts

// Helper pour calculer l'âge (approximatif si pas de date précise)
const getRandomBirthDate = () => {
    return faker.date.birthdate({ min: 18, max: 35, mode: 'age' });
};

const main = async () => {
    // 1. Localiser le fichier JSON
    // On cherche d'abord dans backend/, sinon dans backend/prisma/
    let filePath = path.join(__dirname, '..', DUMP_FILE);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, DUMP_FILE);
    }

    if (!fs.existsSync(filePath)) {
        console.error(`❌ Fichier '${DUMP_FILE}' introuvable !`);
        console.error("👉 Lance d'abord le script Python 'fetch_users_to_json.py' pour générer les données.");
        process.exit(1);
    }

    // 2. Lire et parser le JSON
    console.log(`📂 Lecture de ${filePath}...`);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const realUsers = JSON.parse(rawData);

    console.log(`🌱 Importation de ${realUsers.length} utilisateurs depuis le dump...`);

    let count = 0;

    for (const realUser of realUsers) {
        // --- Mapping des données ---
        
        // 1. Genre : L'API 42 ne donne PAS le genre. 
        // On doit le simuler aléatoirement pour que le matching fonctionne.
        // (Note: La photo réelle peut ne pas correspondre au genre assigné ici, c'est une limitation du test)
        const fakeGender = faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']);
        
        // 2. Dates
        const birthDate = getRandomBirthDate();
        const age = new Date().getFullYear() - birthDate.getFullYear();

        // 3. Photo
        // On utilise la vraie photo 42 si elle existe, sinon une placeholder
        const realPhotoUrl = realUser.image?.link || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
        
        // 4. Campus
        // On essaie de trouver le campus principal, sinon Paris par défaut
        let campusName = 'Paris';
        if (realUser.campus && realUser.campus.length > 0) {
            campusName = realUser.campus[0].name;
        }

        const userPayload = {
            intraId: realUser.id,
            email: realUser.email,
            login: realUser.login,
            // On utilise le displayname ou le login comme nom d'affichage
            name: realUser.displayname || realUser.login, 
            
            birthDate: birthDate,
            gender: fakeGender,
            campus: campusName,
            
            // Bio générée (car pas dispo dans l'API publique souvent)
            bio: faker.lorem.sentences(2),
            
            intraPhoto: realPhotoUrl,
            // On laisse customPhotos vide pour l'instant pour ne pas mélanger 
            // des vrais visages 42 avec des visages IA, ça ferait bizarre.
            customPhotos: [], 

            intent: faker.helpers.arrayElement(INTENTS),
            isOnboarded: true, // On considère qu'ils ont fini l'inscription pour qu'ils apparaissent
            
            genderPref: faker.helpers.arrayElement(GENDER_PREFS),
            ageMin: Math.max(18, age - 5),
            ageMax: age + 5,

            // Nouveaux champs (Quota & Visibilité)
            dailyQuota: 30,
            visibilityScore: parseFloat(faker.number.float({ min: 0.5, max: 2.0 }).toFixed(2)),
            lastActive: new Date() // Simule une activité récente
        };

        try {
            await prisma.user.upsert({
                where: { login: userPayload.login }, // Clé unique
                update: userPayload, // Met à jour si existe déjà (pratique pour rafraîchir les données)
                create: userPayload,
            });
            process.stdout.write(".");
            count++;
        } catch (e) {
            console.error(`\n❌ Erreur sur ${userPayload.login}:`, e.message);
        }
    }

    console.log(`\n\n✅ Terminé ! ${count} profils importés/mis à jour avec succès.`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });