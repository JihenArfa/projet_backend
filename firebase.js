// const admin = require('firebase-admin');

// // Remplace le chemin ci-dessous par le chemin vers ton fichier de clé privée JSON
// const serviceAccount = require('./cle.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// module.exports = admin;
// firebase.js
const admin = require("firebase-admin");
const path = require("path");

// Remplace ceci par le chemin vers ton fichier serviceAccountKey.json
const serviceAccount = require(path.resolve(__dirname, "./cle.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { db };
