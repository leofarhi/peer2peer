const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
// On récupère la clé du .env
const secretKey = process.env.MESSAGE_ENCRYPTION_KEY;

// Fonction pour chiffrer un texte avant de le mettre en DB
const encrypt = (text) => {
    if (!secretKey || secretKey.length !== 32) {
        throw new Error("MESSAGE_ENCRYPTION_KEY must be 32 characters long");
    }
    const iv = crypto.randomBytes(16); // Vecteur d'initialisation aléatoire
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    // On stocke le IV et le texte chiffré ensemble (séparés par :)
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

// Fonction pour déchiffrer quand on envoie au Frontend
const decrypt = (hash) => {
    if (!secretKey) throw new Error("No Secret Key");
    const [ivHex, contentHex] = hash.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(contentHex, 'hex')), decipher.final()]);

    return decrypted.toString();
};

module.exports = { encrypt, decrypt };