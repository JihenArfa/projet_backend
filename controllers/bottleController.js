


const Bottle = require('../models/bottle');
const mongoose = require('mongoose');

// ➕ Ajouter une bouteille
exports.addBottle = async (req, res) => {
  try {
    const { type, quantity, binId, userId } = req.body;

    if (!type || !quantity || !binId || !userId) {
      return res.status(400).json({ message: "Champs manquants." });
    }

    const newBottle = new Bottle({
      type,
      quantity,
      binId,
      userId,
      createdAt: new Date()
    });

    await newBottle.save();
    res.status(201).json({ message: "Bouteille ajoutée avec succès", data: newBottle });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une bouteille :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout de la bouteille", error });
  }
};

// 📦 Compter les bouteilles par poubelle
exports.getBottleCountByBin = async (req, res) => {
  try {
    const { binId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(binId)) {
      return res.status(400).json({ message: "ID de poubelle invalide." });
    }

    const bottleCounts = await Bottle.aggregate([
      { $match: { binId: new mongoose.Types.ObjectId(binId) } },
      { 
        $group: { 
          _id: "$type",
          total: { $sum: "$quantity" }
        }
      }
    ]);

    if (!bottleCounts || bottleCounts.length === 0) {
      return res.status(404).json({ message: "Aucune bouteille trouvée pour cette poubelle." });
    }

    const result = {};
    bottleCounts.forEach(bottle => {
      result[bottle._id] = bottle.total;
    });

    res.json(result);
  } catch (error) {
    console.error("Erreur lors du comptage des bouteilles:", error);
    res.status(500).json({ message: "Erreur lors du comptage des bouteilles par poubelle", error });
  }
};



exports.getBottleCountByUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("UserID reçu :", userId);

    // Vérification de la validité de l'ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    // Agrégation pour compter les bouteilles par type
    const bottleCounts = await Bottle.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } }, // Conversion en ObjectId
      { 
        $group: { 
          _id: "$type",
          total: { $sum: "$quantity" }
        }
      }
    ]);

    console.log("Résultat de l'agrégation :", bottleCounts);

    // Structurer la réponse sous forme d'objet avec des valeurs par défaut (0)
    const result = {
      plastique: 0,
      verre: 0
    };

    bottleCounts.forEach(bottle => {
      result[bottle._id] = bottle.total;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors du comptage des bouteilles :", error);
    res.status(500).json({ message: "Erreur serveur lors du comptage des bouteilles", error });
  }
};

// 🔍 Obtenir toutes les bouteilles d’une poubelle avec les noms des utilisateurs
exports.getBottlesByBinId = async (req, res) => {
  const { binId } = req.params;
  try {
    // Récupérer toutes les bouteilles et inclure les informations de l'utilisateur
    const bottles = await Bottle.find({ binId }).populate('userId', 'userName'); // 'userName' est le champ que nous voulons

    // Si vous souhaitez récupérer les informations avec le nom d'utilisateur pour chaque bouteille, vous pouvez le faire ainsi
    const bottlesWithUserNames = bottles.map(bottle => {
      return {
        ...bottle._doc,  // Récupère toutes les propriétés de la bouteille
        userName: bottle.userId ? bottle.userId.userName : 'Anonyme' // Si l'utilisateur existe, on récupère son nom, sinon "Anonyme"
      };
    });

    res.status(200).json(bottlesWithUserNames);
  } catch (err) {
    console.error("Erreur getBottlesByBinId :", err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des bouteilles' });
  }
};

// ✅ Total des bouteilles de tous les types
exports.getTotalBottleCounts = async (req, res) => {
  try {
    const result = await Bottle.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$quantity" }
        }
      }
    ]);

    const response = { plastique: 0, verre: 0 };
    result.forEach(item => {
      response[item._id] = item.total;
    });

    res.status(200).json(response);
  } catch (err) {
    console.error("Erreur lors de la récupération du total des bouteilles :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

// ✅ Contributions utilisateur pour une poubelle donnée avec noms des utilisateurs
exports.getUserContributionsByBin = async (req, res) => {
  const { binId } = req.params;
  try {
    // Récupérer toutes les contributions avec les informations de l'utilisateur
    const contributions = await Bottle.find({ binId }).populate('userId', 'firstName lastName'); // 'userName' est le champ que nous voulons

    // Si vous souhaitez que les contributions affichent les noms des utilisateurs associés
    const contributionsWithUserNames = contributions.map(contribution => {
      return {
        ...contribution._doc,
        userName: contribution.userId ?  `${contribution.userId.firstName} ${contribution.userId.lastName}` : 'Anonyme'
      };
    });

    res.status(200).json(contributionsWithUserNames);
  } catch (err) {
    console.error("Erreur lors de la récupération des contributions par poubelle :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

