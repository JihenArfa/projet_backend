const express = require('express');
const { register, login,logout ,verifyResetCode,resetPassword,forgotPassword} = require('../controllers/authController')
const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout); 
 



//Route protégée
// router.get('/profile', verifyToken, (req, res) => {
//     res.json({ 
//       message: 'Accès autorisé',
//       user: req.user // L'utilisateur est disponible grâce au middleware
//     });
//   });


router.post('/verify-reset-code', verifyResetCode);

  router.post("/forgot-password", forgotPassword);
// router.post("/verify-token", verifyToken);
router.post("/reset-password", resetPassword);
module.exports = router

