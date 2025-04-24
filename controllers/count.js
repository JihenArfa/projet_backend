

const mongoose = require('mongoose');
const Utilisateur = require('../models/user');
const Poubelle = require('../models/Poubelle');

// ✅ Comptage total des utilisateurs
const getUserCount = async (req, res) => {
  try {
    const count = await Utilisateur.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("❌ Erreur lors du comptage des utilisateurs :", error);
    res.status(500).json({ message: 'Erreur lors du comptage des utilisateurs' });
  }
};

// ✅ Comptage total des poubelles
const getpoubelleCount = async (req, res) => {
  try {
    const count = await Poubelle.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("❌ Erreur lors du comptage des poubelles :", error);
    res.status(500).json({ message: 'Erreur lors du comptage des poubelles' });
  }
};

// ✅ Comptage des bouteilles par utilisateur et par poubelle
const getBottleCountByUserPerBin = async (req, res) => {
  const { userId } = req.params;

  try {
    const results = await Bottle.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        }
      },
      {
        $group: {
          _id: "$binId",
          totalBottles: { $sum: "$quantity" },
        }
      },
      {
        $lookup: {
          from: "poubelles", // nom de la collection dans MongoDB (attention à la casse)
          localField: "_id",
          foreignField: "_id",
          as: "binInfo"
        }
      },
      { $unwind: "$binInfo" },
      {
        $project: {
          _id: 0,
          binId: "$_id",
          binName: "$binInfo.name",
          totalBottles: 1
        }
      }
    ]);

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Erreur lors de l'agrégation des bouteilles :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  
  getUserCount,
  getpoubelleCount,
   getBottleCountByUserPerBin
};

