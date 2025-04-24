

const Poubelle = require('../models/Poubelle');



// Ajouter une poubelle
exports.addPoubelle = async (req, res) => {
    try {
        const { name, lat, lng, firstname,  lastname } = req.body;

        if (!name || !lat || !lng) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }

        const newPoubelle = new Poubelle({ name, latitude: lat, longitude: lng , firstname,  lastname});

        await newPoubelle.save();
        res.status(201).json(newPoubelle);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la poubelle', error });
    }
};

// Récupérer toutes les poubelles
exports.getPoubelles = async (req, res) => {
    try {
        const poubelles = await Poubelle.find();
        res.status(200).json(poubelles);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des poubelles', error });
    }
};

// Exemple d'API en Node.js pour supprimer une poubelle
exports.deletepoubelle = async (req, res) => {
    const poubelleId = req.params.id;
    console.log('Suppression de la poubelle avec ID:', poubelleId); // Vérifiez l'ID
  
    try {
      const poubelle = await Poubelle.findByIdAndDelete(poubelleId);
      if (!poubelle) {
        return res.status(404).send('Poubelle non trouvée.');
      }
      res.status(200).send('Poubelle supprimée avec succès.');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      res.status(500).send('Erreur lors de la suppression de la poubelle.');
    }
  };
  
  

// Fonction pour récupérer le nombre total de bouteilles pour un utilisateur
exports.getTotalBottlesByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Trouver toutes les poubelles associées à l'utilisateur
    const poubelles = await Poubelle.find({ userId });

    if (poubelles.length === 0) {
      return res.status(404).json({ message: "Aucune poubelle trouvée pour cet utilisateur." });
    }

    // Calculer le total des bouteilles en plastique et en verre
    let totalPlastique = 0;
    let totalVerre = 0;

    poubelles.forEach(poubelle => {
      totalPlastique += poubelle.plastique;
      totalVerre += poubelle.verre;
    });

    res.status(200).json({
      totalPlastique,
      totalVerre,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};