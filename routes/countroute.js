const express = require('express');
const router = express.Router();
const { getUserCount, getpoubelleCount,getBottleCountByUserPerBin } = require('../controllers/count');

// Define the route for getting user count
router.get('/count',getUserCount);
router.get('/countpoubelle',getpoubelleCount);
router.get('/count/bin/:binId', getBottleCountByUserPerBin);
module.exports = router;
