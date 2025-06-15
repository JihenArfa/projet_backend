const express = require('express');
const { getAllUsers, getUserById ,getUserBottleStats,updateUser,forgotPassword,resetPassword} = require('../controllers/userController'); 
const router = express.Router();

// Récupérer tous les utilisateurs
router.get('/users', getAllUsers);
router.get('/users/:id',getUserById);
// Récupérer un utilisateur par ID
router.get('/users/:userId/bottles', getUserBottleStats);


router.put('/users/:id', updateUser);










router.get('/users/:userId/bottles', getUserBottleStats);
module.exports = router;
