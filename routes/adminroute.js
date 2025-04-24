const express = require('express');
const router = express.Router();
const { createAdminIfNotExist ,login,getAdmin}  = require('../controllers/adminControllers');



// Route pour vérifier et créer un admin si nécessaire
router.post('/admin',createAdminIfNotExist);
// router.post('/login', login);

// Route pour récupérer les informations de l'admin connecté
router.get('/me', getAdmin);
module.exports = router;
