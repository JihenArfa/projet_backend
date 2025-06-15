


const mongoose = require('mongoose');

const PoubelleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    firstname: String,  // 👈 ajoute ça
    lastname: String, 
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }
}, { timestamps: true });

// Créer l'index géospatial sur le champ location
PoubelleSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Poubelle', PoubelleSchema);
