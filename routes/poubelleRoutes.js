
const express = require('express');
const router = express.Router();
const { addPoubelle, getPoubelles,getNearestBin,updateLocationCoordinates, getPoubelleById,updatePoubelle,deletepoubelle,getTotalBottlesByUser } = require('../controllers/poubelleController');

// Route pour ajouter une poubelle
router.post('/poubelle', addPoubelle);
// Route pour récupérer toutes les poubelles
router.get('/poubelle', getPoubelles);

router.get('/proche',getNearestBin);
router.post('/proche', getNearestBin);
// Exemple de route qui utilise Bottle
// router.get('/poubelles', async (req, res) => {
//     try {
//       // Votre logique pour récupérer les poubelles et compter les bouteilles
//       const poubelles = await Poubelle.find();
  
//       const result = await Promise.all(poubelles.map(async (poubelle) => {
//         const plastiqueCount = await Bottle.countDocuments({ binId: poubelle._id, type: 'plastique' });
//         const verreCount = await Bottle.countDocuments({ binId: poubelle._id, type: 'verre' });
  
//         return {
//           ...poubelle.toObject(),
//           bottles: {
//             plastique: plastiqueCount,
//             verre: verreCount
//           }
//         };
//       }));
  
//       res.json(result);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });
router.delete('/poubelle/:id',deletepoubelle);
router.get('/poubelles/:id', getPoubelleById);

router.get('/total-bottles/:userId', getTotalBottlesByUser);

router.put('/updatePoubelle/:id', updatePoubelle);

router.put('/update-coordinates', updateLocationCoordinates);

module.exports = router;
