
const express = require('express');
const router = express.Router();
const { addPoubelle, getPoubelles, deletepoubelle,getTotalBottlesByUser } = require('../controllers/poubelleController');

// Route pour ajouter une poubelle
router.post('/poubelle', addPoubelle);

// Route pour récupérer toutes les poubelles
router.get('/poubelle', getPoubelles);
router.delete('/poubelle/:id',deletepoubelle);


router.get('/total-bottles/:userId', getTotalBottlesByUser);
module.exports = router;
