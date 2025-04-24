const admin = require('firebase-admin');

// Remplace le chemin ci-dessous par le chemin vers ton fichier de clé privée JSON
const serviceAccount = require('./cle.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
