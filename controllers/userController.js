const User = require('../models/user');

;
// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'firstName lastName email telephone genre createdAt'); // Sélectionner les champs visibles
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    console.log("Requête reçue avec ID:", req.params.id); // Vérification de l'ID reçu
    const user = await User.findById(req.params.id, 'firstName lastName email telephone genre');
    
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};



exports.getUserBottleStats = async (req, res) => {
  const { userId } = req.params;

  try {
    const bouteilles = await Bottle.find({ userId }); // ou 'user' selon ton schéma
    const totalVerre = bouteilles.filter(b => b.type === 'verre').length;
    const totalPlastique = bouteilles.filter(b => b.type === 'plastique').length;

    res.json({ totalVerre, totalPlastique });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


