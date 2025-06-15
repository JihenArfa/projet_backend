const User = require('../models/user');




// Récupérer tous les utilisateurs (hors admins)
exports.getAllUsers = async (req, res) => {
  try {
    // Filtrer les utilisateurs avec role !== 'admin'
    const users = await User.find(
      { role: { $ne: 'admin' } }, // $ne = not equal
      'firstName lastName email telephone genre createdAt'
    );

    res.status(200).json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
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


// Fonction pour mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  const userId = req.params.id;  // Récupère l'id de l'utilisateur dans l'URL
  const { firstName, lastName, email, password,telephone, adresse, genre, role } = req.body;

  try {
    // Recherche de l'utilisateur dans la base de données par son ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mise à jour des champs de l'utilisateur
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
   user.password= password || user.password;
    user.telephone = telephone || user.telephone;
    user.adresse = adresse || user.adresse;
    user.genre = genre || user.genre;
    user.role = role || user.role;

    // Sauvegarde des modifications dans la base de données
    const updatedUser = await user.save();

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
};