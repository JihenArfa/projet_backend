const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Définir le schéma de l'utilisateur avec un rôle
const utilisateurSchema = new mongoose.Schema({
  nom: String,
  email: { type: String, unique: true },
  password: String,  // Le mot de passe sera haché dans le contrôleur
  role: { type: String, default: 'user' }  // Par défaut, l'utilisateur est un "user"
});

// Avant de sauvegarder l'utilisateur, hacher son mot de passe
utilisateurSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10); // Hachage du mot de passe
  }
  next();
});

// Méthode pour créer un admin si aucun admin n'existe
utilisateurSchema.statics.createAdminIfNotExist = async function() {
  const adminCount = await this.countDocuments({ role: 'admin' });

  if (adminCount === 0) {
    const admin = new this({
      nom: 'Admin',
      email: 'admin@gmail.com',  // Vous pouvez personnaliser cette adresse
      password: 'admin',  // Assurez-vous de hacher ce mot de passe en production
      role: 'admin',
    });
    await admin.save();
    console.log('Compte admin créé avec succès!');
  } else {
    console.log('Un administrateur existe déjà.');
  }
};

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;
