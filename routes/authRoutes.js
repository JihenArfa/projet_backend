const express = require('express');
const { register, login,logout ,verifyToken,resetPassword,forgotPassword} = require('../controllers/authController')
const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout); 
 



//Route protégée
router.get('/profile', verifyToken, (req, res) => {
    res.json({ 
      message: 'Accès autorisé',
      user: req.user // L'utilisateur est disponible grâce au middleware
    });
  });




  router.post("/forgot-password", forgotPassword);
// router.post("/verify-token", verifyToken);
router.post("/reset-password",verifyToken, resetPassword);
module.exports = router

