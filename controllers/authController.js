




const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require("bcryptjs");
const enregistrerDansFirestore = require("../controllers/enregistreController");

// Stockage des tokens invalides (solution temporaire pour développement)
const invalidTokens = new Set();

exports.register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    telephone,
    genre,
    adresse,
    role,
    rfid
  } = req.body;

  try {
    // Vérification email déjà utilisé
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Vérification RFID déjà utilisé
    const existingRFID = await User.findOne({ rfid });
    if (existingRFID) {
      return res.status(400).json({ message: "Ce RFID est déjà attribué à un utilisateur" });
    }

    // Création du nouvel utilisateur
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      telephone,
      genre,
      adresse,
      role: role || "user",
      rfid
    });

    await newUser.save();

    // Enregistrement dans Firestore
    await enregistrerDansFirestore({
      name: `${firstName} ${lastName}`,
      rfid: rfid,
      userId: newUser._id.toString() // ID MongoDB
    });

    // Génération du token
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRATION) {
      return res.status(500).json({ message: "Variables JWT manquantes" });
    }

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    return res.status(201).json({
      message: "Utilisateur créé avec succès",
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
        rfid: newUser.rfid
      }
    });

  } catch (error) {
    console.error("Erreur lors de enregistrement :", error.message);
    return res.status(500).json({ error: error.message, message: "Erreur serveur" });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Tentative de connexion avec : ", email, password);

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log("Utilisateur non trouvé");
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    console.log("Utilisateur trouvé :", user);

    const isMatch = await user.comparePassword(password);
    console.log("Mot de passe correspond ?", isMatch);

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


exports.verifyResetCode = async (req, res) => {
  try {
    const { email, resetCode } = req.body;

    // Vérification que l'email et le code de réinitialisation sont fournis
    if (!email || !resetCode) {
      return res.status(400).json({ message: "Email et code requis." });
    }

    // Recherche de l'utilisateur par son email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email." });
    }

    // Log pour vérifier les valeurs des codes
    console.log(`Code fourni: ${resetCode}, Code stocké: ${user.resetCode}`);

    // Conversion explicite du resetCode en entier pour comparaison
    if (parseInt(user.resetCode, 10) !== parseInt(resetCode, 10)) {
      return res.status(400).json({ message: "Code invalide" });
    }

    // Si les codes correspondent, générer un token JWT pour la réinitialisation
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Réponse avec le token JWT pour la réinitialisation
    res.json({ message: "Code valide", token });
  } catch (error) {
    // Log de l'erreur pour le débogage
    console.error("Erreur dans la vérification du code de réinitialisation :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // Token JWT (web)
    const { resetCode, newPassword } = req.body;

    console.log("📥 Requête reçue avec :");
    console.log("  🔑 Token :", token);
    console.log("  📧 ResetCode :", resetCode);
    console.log("  🔐 NewPassword :", newPassword);

    if (!newPassword) {
      console.log("❌ Nouveau mot de passe manquant.");
      return res.status(400).json({ message: "Nouveau mot de passe requis." });
    }

    let user = null;

    // ✅ Cas 1 : via token (web)
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token décodé :", decoded);

        user = await User.findById(decoded.userId);
        if (!user) {
          console.log("❌ Utilisateur non trouvé avec l'ID :", decoded.userId);
          return res.status(404).json({ message: "Utilisateur non trouvé via le token." });
        }
        console.log("✅ Utilisateur trouvé via token :", user.email);
      } catch (error) {
        console.error("❌ Erreur de vérification du token :", error.message);
        return res.status(400).json({ message: "Token invalide ou expiré." });
      }
    }

    //  Cas 2 : via resetCode (mobile)
    if (!user && resetCode) {
      console.log(" Recherche de l'utilisateur avec resetCode :", resetCode);
      const parsedCode = parseInt(resetCode, 10);
      console.log("ResetCode converti :", parsedCode);

      user = await User.findOne({ resetCode: parsedCode });
      if (!user) {
        console.log(" Aucun utilisateur trouvé avec le resetCode :", parsedCode);
        return res.status(400).json({ message: "Code de réinitialisation invalide." });
      }

      console.log(" Utilisateur trouvé via resetCode :", user.email);
    }

    //  Aucun utilisateur trouvé
    if (!user) {
      console.log(" Aucun utilisateur trouvé après vérification des deux méthodes.");
      return res.status(400).json({ message: "Impossible de réinitialiser le mot de passe." });
    }

    // Mise à jour du mot de passe (sans re-hash manuel)
    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpiration = undefined;

    await user.save(); // Le hash se fera automatiquement via le middleware

    console.log(" Mot de passe mis à jour pour l'utilisateur :", user.email);
    return res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });

  } catch (error) {
    console.error(" Erreur dans la réinitialisation du mot de passe :", error);
    return res.status(500).json({ message: "Erreur interne du serveur.", error: error.message });
  }
};







