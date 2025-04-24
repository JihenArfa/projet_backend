const mongoose = require('mongoose');

const PoubelleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    
    firstname: String,  // 👈 ajoute ça
    lastname: String, 

    plastique: { type: Number, default: 0 }, // Ajout du champ pour le plastique
    verre: { type: Number, default: 0 },  
},
 { timestamps: true });

module.exports = mongoose.model('Poubelle', PoubelleSchema);

