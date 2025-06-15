


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  },
  password: { type: String, required: true, minlength: 8 },
  telephone: { type: Number },
  genre: { type: String, enum: ["femme", "homme"], default: "homme" },
  adresse: { type: String },

  role: { type: String, enum: ["user", "admin"], default: "user" },
  resetCode: { type: String },
  resetCodeExpiration: { type: Date },

  rfid: {
    type: String,
    unique: true,
    sparse: true, // Permet à certains utilisateurs de ne pas avoir de RFID
  match: /^[A-Fa-f0-9]{8,32}$/
// Exemple de format d'UID RFID
  }

}, {
  timestamps: true
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
