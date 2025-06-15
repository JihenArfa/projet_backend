
// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const enregistrerDansFirestore = require("../controllers/enregistreController");

router.post("/enregistrer", async (req, res) => {
  try {
    await enregistrerDansFirestore(req.body); // tu peux ajuster selon ton besoin
    res.status(200).json({ message: "Données enregistrées avec succès" });
  } catch (error) {
    res.status(400).json({ error: error.message || "Erreur serveur" });  }
});

module.exports = router;


