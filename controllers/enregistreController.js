


const { db } = require("../firebase");

async function enregistrerDansFirestore(donnees) {
  try {
    // Vérifie si un utilisateur avec ce rfid existe déjà dans Firestore
    const snapshot = await db.collection("users").where("rfid", "==", donnees.rfid).get();

    if (!snapshot.empty) {
      console.warn("⚠️ Ce RFID existe déjà dans Firestore (double entrée évitée)");
      return;
    }

    // Enregistre dans Firestore
    const docRef = await db.collection("users").add({
      name: donnees.name,
      rfid: donnees.rfid,
      userId: donnees.userId
    });

    console.log("✅ Données enregistrées dans Firestore avec l'ID :", docRef.id);
  } catch (error) {
    console.error("❌ Erreur Firestore :", error.message);
    throw error;
  }
}

module.exports = enregistrerDansFirestore;
