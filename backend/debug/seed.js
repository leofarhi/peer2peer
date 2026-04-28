// backend/prisma/seed.js
require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

// Configuration
const INTENTS = ['LTS', 'COFFEE', 'OPEN_SOURCE', 'SIDE_PROJECT', 'RUSH'];
const CAMPUSES = ['Paris', 'Lyon', 'Fremont', 'Helsinki', 'Seoul', 'Quebec', 'Lausanne'];
const GENDER_PREFS = ['MEN', 'WOMEN', 'ALL'];

// Helper pour générer des photos cohérentes avec le genre
const generatePhotos = (gender) => {
    const totalPhotos = faker.number.int({ min: 1, max: 5 }); // 1 à 5 photos au total
    const photos = [];
    
    // Déterminer le type pour l'URL (men/women)
    let type = 'men';
    if (gender === 'FEMALE') type = 'women';
    else if (gender === 'OTHER') type = faker.helpers.arrayElement(['men', 'women']); // Mix pour Other

    for (let i = 0; i < totalPhotos; i++) {
        // On utilise randomuser.me pour avoir des visages stables et genrés
        const id = faker.number.int({ min: 1, max: 99 });
        photos.push(`https://randomuser.me/api/portraits/${type}/${id}.jpg`);
    }

    return {
        intraPhoto: photos[0], // La première est la photo "42"
        customPhotos: photos.slice(1) // Le reste (0 à 4 photos)
    };
};

const createRandomUser = (index) => {
    const gender = faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']);
    
    // Génération du prénom en fonction du genre pour le réalisme
    const firstName = gender === 'MALE' 
        ? faker.person.firstName('male') 
        : (gender === 'FEMALE' ? faker.person.firstName('female') : faker.person.firstName());
    
    const lastName = faker.person.lastName();
    const login = (firstName.substring(0, 1) + lastName).toLowerCase().substring(0, 8) + faker.number.int({min: 1, max: 99});
    
    // Date de naissance (entre 18 et 35 ans environ)
    const birthDate = faker.date.birthdate({ min: 18, max: 35, mode: 'age' });
    
    // Calcul de l'âge pour les préférences
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    const { intraPhoto, customPhotos } = generatePhotos(gender);

    return {
        intraId: 100000 + index, // ID unique fictif
        email: `${login}@student.42.fr`,
        login: login,
        name: firstName, // Juste le prénom pour l'affichage
        birthDate: birthDate,
        gender: gender,
        campus: faker.helpers.arrayElement(CAMPUSES),
        bio: faker.lorem.sentences(2), // Bio en latin, ou utilise faker.person.bio() si dispo
        intraPhoto: intraPhoto,
        customPhotos: customPhotos,
        intent: faker.helpers.arrayElement(INTENTS),
        isOnboarded: true,
        // Logique simple : un mec cherche femme, une femme cherche mec (statistiquement pour le seed), mais modifiable
        genderPref: faker.helpers.arrayElement(GENDER_PREFS), 
        ageMin: Math.max(18, age - 5),
        ageMax: age + 5
    };
};

const main = async () => {
    // Récupérer l'argument (node seed.js 50) ou défaut à 10
    const countArg = process.argv[2];
    const COUNT = countArg ? parseInt(countArg) : 10;

    console.log(`🌱 Génération de ${COUNT} utilisateurs aléatoires...`);

    for (let i = 0; i < COUNT; i++) {
        const user = createRandomUser(i);
        
        try {
            await prisma.user.upsert({
                where: { login: user.login }, // On utilise le login comme clé unique ici
                update: {},
                create: user,
            });
            // Barre de progression simple
            process.stdout.write("."); 
        } catch (e) {
            console.error(`\n❌ Erreur sur ${user.login}:`, e.message);
        }
    }

    console.log(`\n\n✅ Terminé ! ${COUNT} profils créés.`);
    console.log(`ℹ️  Exemple de login généré : ${createRandomUser(1).login}`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });