const admin = require('firebase-admin');
const Bottle = require('../models/bottle'); // Modèle Mongoose pour MongoDB

// Initialiser Firebase Admin SDK
const serviceAccount = require('../cle.json');
const fire = require('../firebase');

if (!admin.apps.length) {
    admin.initializeApp();
} else {
    console.log('Firebase est déjà initialisé');
}

// Fonction pour récupérer les données depuis Firestore et les enregistrer dans MongoDB
async function syncBottlesFromFirestore() {
    const db = admin.firestore();
    const bottlesSnapshot = await db.collection('bottles').get();
  
    // Parcourir chaque document Firestore et les enregistrer dans MongoDB
    bottlesSnapshot.forEach(async (doc) => {
        const bottleData = doc.data(); // Récupérer les données du document
        const { type, quantity, binId ,userId} = bottleData; // Récupérer les données nécessaires
  
        // S'assurer que le type est valide
        if (!type || !['plastique', 'verre'].includes(type)) {
            console.log("Donnée invalide:", bottleData);
            return;
        }
  
        // S'assurer que binId est valide
        if (!binId) {
            console.log("ID de poubelle manquant pour la bouteille:", bottleData);
            return;
        }

         // Vérifier si la bouteille existe déjà dans MongoDB
         const existingBottle = await Bottle.findOne({ type, quantity, binId ,userId});
         if (existingBottle) {
             console.log(`Bouteille déjà existante: ${existingBottle}`);
             return;
         }

        // La quantity est déjà un nombre, donc pas besoin de la convertir
        const quantityNumber = quantity; 
  
        // Créer une nouvelle instance du modèle Mongoose et enregistrer
        const newBottle = new Bottle({ type, quantity: quantityNumber, binId ,userId});
        await newBottle.save();
        console.log(`Bouteille ajoutée avec succès: ${newBottle}`);
    });
}
  
// Appeler la fonction pour synchroniser les données
syncBottlesFromFirestore();
