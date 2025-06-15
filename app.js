const dotenv=require('dotenv');// Charger les variables d'environnement
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminroute = require('./routes/adminroute');
const poubelleRoutes = require("./routes/poubelleRoutes");
const bottleRoutes = require("./routes/bottleRoutes");
const admin = require('./models/admin');
const countroute = require('./routes/countroute');
const cors = require('cors');
const syncBottles = require('./scripts/syncbottles')

dotenv.config({ path: "./.env" });

const app = express();
// Activer CORS pour toutes les requêtes
app.use(cors());
app.use(bodyParser.json());
// Middleware pour parser le JSON
app.use(express.json());



// Connexion à MongoDB en utilisant l'URI depuis .env
const BD=process.env.MONGO_URI.replace("<db_password>", process.env.DB_PASSWORD);
mongoose.connect(BD)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => {
    console.error('❌ Erreur de connexion à MongoDB:', err);
    // res.status(500).json({ message: 'Erreur de connexion à MongoDB', error: err }); // ❌ Erreur ici
  });


// Utilisation des routes d'authentification
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', countroute);
app.use('/api', adminroute);
app.use("/api/poubelles", poubelleRoutes);
app.use("/api", bottleRoutes);

// Démarrer le serveur
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur le port ${port}`);
});
