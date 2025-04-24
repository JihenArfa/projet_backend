const express = require('express');
const mongoose = require('mongoose');
const {  getBottleCountByBin, getBottleCountByUsers, addBottle,getTotalBottleCounts,getUserContributionsByBin } = require('../controllers/bottleController');

const router = express.Router();

router.get('/count/:binId',getBottleCountByBin);
router.get('/countt/:userId',getBottleCountByUsers);
router.post('/add', addBottle);
router.get('/count/:userId/:binId', getBottleCountByUsers);


// ✅ Total des bouteilles
router.get('/countTotalBouteilles',getTotalBottleCounts);

// ✅ Contributions utilisateur par poubelle
router.get('/contributions/:binId', getUserContributionsByBin);

module.exports = router;
