



// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// // Fonction d'enregistrement
// exports.register = async (req, res) => {
//   const { firstName, lastName, email, password, telephone, genre, adresse, role } = req.body;

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email déjà utilisé' });
//     }

//     const newRole = role || 'user';

//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       password,
//       telephone,
//       genre,
//       adresse,
//       role: newRole,
//     });

//     await newUser.save();

//     console.log('Nouvel utilisateur enregistré :', newUser);

//     if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRATION) {
//       return res.status(500).json({ message: 'Variables JWT manquantes' });
//     }

//     const token = jwt.sign(
//       { userId: newUser._id },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRATION }
//     );

//     return res.status(201).json({
//       message: 'Utilisateur créé avec succès',
//       token,
//       userId: newUser._id,
//       user: {
//         firstName: newUser.firstName,
//         lastName: newUser.lastName,
//         email: newUser.email,
//         telephone: newUser.telephone,
//         genre: newUser.genre,
//         adresse: newUser.adresse,
//         role: newUser.role,
//         createdAt: newUser.createdAt,
//       }
//     });

//   } catch (error) {
//     console.error('Erreur lors de l’enregistrement :', error.message);
//     return res.status(500).json({ error: error.message, message: 'Erreur serveur' });
//   }
// };







// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     console.log('Tentative de connexion avec :', email);

//     // Recherche l'utilisateur avec l'email, incluant le champ password
//     const user = await User.findOne({ email }).select('+password');

//     if (!user) {
//       return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
//     }

//     console.log('Mot de passe entré :', password);
//     console.log('Mot de passe en base :', user.password);

//     // Comparaison du mot de passe avec la méthode du modèle
//     const isMatch = await user.comparePassword(password);
//     console.log('Résultat bcrypt.compare:', isMatch);

//     if (!isMatch) {
//       return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
//     }

//     // Création du token avec l'ID de l'utilisateur et le rôle
//     const token = jwt.sign(
//       { userId: user._id, role: user.role }, // Utilise user._id et user.role ici
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRATION }
//     );

//     return res.status(200).json({
//       message: 'Connexion réussie',
//       token,
//       userId: user._id,
//       role: user.role || 'user'
//     });

//   } catch (error) {
//     console.error('Erreur lors de la connexion :', error);
//     return res.status(500).json({ message: 'Erreur serveur', error: error.message });
//   }
// };

// exports.logout = (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];  // Récupérer le token du header

//   if (!token) {
//     return res.status(400).json({ message: 'Token manquant' });
//   }

//   // Ici, on ne fait rien avec le token, on laisse l'expiration naturelle se produire

//   return res.status(200).json({ message: 'Déconnexion réussie' });
// };



const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Stockage des tokens invalides (solution temporaire pour développement)
const invalidTokens = new Set();

// Fonction d'enregistrement
exports.register = async (req, res) => {
  const { firstName, lastName, email, password, telephone, genre, adresse, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const newRole = role || 'user';

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      telephone,
      genre,
      adresse,
      role: newRole,
    });

    await newUser.save();

    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRATION) {
      return res.status(500).json({ message: 'Variables JWT manquantes' });
    }

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    return res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      userId: newUser._id,
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        telephone: newUser.telephone,
        genre: newUser.genre,
        adresse: newUser.adresse,
        role: newUser.role,
        createdAt: newUser.createdAt,
      }
    });

  } catch (error) {
    console.error('Erreur lors de enregistrement :', error.message);
    return res.status(500).json({ error: error.message, message: 'Erreur serveur' });
  }
};

// Fonction de connexion
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    return res.status(200).json({
      message: 'Connexion réussie',
      token,
      userId: user._id,
      role: user.role || 'user'
    });

  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Fonction de déconnexion
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Token manquant' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Ajouter le token à la liste des tokens invalides
    invalidTokens.add(token);

    return res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion'
    });
  }
};

// Middleware de vérification de token
// exports.verifyToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'Accès non autorisé' });
//     }

//     const token = authHeader.split(' ')[1];
    
//     // Vérifier si le token a été invalidé
//     if (invalidTokens.has(token)) {
//       return res.status(401).json({ message: 'Session expirée' });
//     }

//     // Vérifier la validité du token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Vérifier que l'utilisateur existe toujours
//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       return res.status(401).json({ message: 'Utilisateur introuvable' });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Erreur de vérification du token:', error);
//     return res.status(401).json({ message: 'Token invalide' });
//   }
// };



// const nodemailer = require("nodemailer");
// require("dotenv").config();
// //Transporteur email
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });




// assure-toi que ce chemin est bon
// const invalidTokens = new Set(); // à adapter si tu le gères autrement

exports.verifyToken = async (req, res, next) => {
  try {
    console.log('🛡️ Vérification du token...');
    const authHeader = req.headers.authorization;
    console.log('Authorization Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès non autorisé' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token extrait :', token);

    // Vérifie si le token est dans la blacklist
    if (invalidTokens.has(token)) {
      console.log('❌ Token présent dans la liste noire');
      return res.status(401).json({ message: 'Session expirée' });
    }

    // Vérifie le token avec jwt.verify en version "promesse"
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    console.log('✅ Token décodé :', decoded);

    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log('❌ Utilisateur introuvable avec ID :', decoded.userId);
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    console.log('👤 Utilisateur trouvé :', user.email);
    req.user = user;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.log('⏰ Le token a expiré.');
      return res.status(401).json({ message: 'Votre session a expiré. Veuillez vous reconnecter.' });
    }

    console.log('❌ Erreur de vérification JWT :', err.message);
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};




const sendEmail = require('../utils/email');
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requis." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email." });
    }

    // Générer un code à 6 chiffres pour l'application mobile
    const resetCode = Math.floor(100000 + Math.random() * 900000);
    user.resetCode = resetCode;  // Sauvegarder le code
    await user.save();

    // Générer un token JWT pour la version web
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    
    // Envoyer l'email
    await sendEmail({
      to: email,
      subject: "Réinitialisation du mot de passe",
      html: `
        <p>Voici votre code de réinitialisation pour l'application mobile : ${resetCode}`,
    });

    res.status(200).json({
      message: "Code envoyé par email.",
      // Lien pour l'application web
      resetCode: resetCode,    // Code pour l'application mobile
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};




exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;  // Token JWT pour la version web
    const { resetCode, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "Nouveau mot de passe requis." });
    }

    // Vérification du token pour la version web
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.log('❌ Erreur de vérification du token:', error);
      return res.status(400).json({ message: "Token invalide ou expiré." });
    }

    console.log('✅ Token décodé :', decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérifier le code pour l'application mobile
    if (resetCode && user.resetCode !== parseInt(resetCode)) {
      return res.status(400).json({ message: "Code incorrect." });
    }

    user.password = newPassword;
    user.resetCode = undefined; // Effacer le code de réinitialisation
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("Erreur dans la réinitialisation du mot de passe :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
