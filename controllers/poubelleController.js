



const Poubelle = require('../models/Poubelle');
const Bottle = require('../models/bottle');

// Ajouter une nouvelle poubelle
exports.addPoubelle = async (req, res) => {
  try {
    const { name, lat, lng, firstname, lastname } = req.body;

    if (!name || !lat || !lng) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const newPoubelle = new Poubelle({
      name,
      latitude: lat,
      longitude: lng,
      firstname,
      lastname,
      location: {
        type: "Point",
        coordinates: [lng, lat], // ⚡ Longitude en premier, Latitude en deuxième
      },
    });

    await newPoubelle.save();
    res.status(201).json(newPoubelle);
  } catch (error) {
    console.error(error); // Pour afficher l'erreur dans la console en cas de problème
    res.status(500).json({ message: "Erreur lors de l'ajout de la poubelle", error });
  }
};

// Récupérer toutes les poubelles
exports.getPoubelles = async (req, res) => {
  try {
    const poubelles = await Poubelle.find();

    const result = await Promise.all(poubelles.map(async (poubelle) => {
      // Récupération des sommes par type de bouteille
      const bottlesAggregation = await Bottle.aggregate([
        { $match: { binId: poubelle._id } },
        { $group: { 
          _id: "$type",
          total: { $sum: "$quantity" }
        }}
      ]);

      let plastiqueCount = 0;
      let verreCount = 0;

      bottlesAggregation.forEach(entry => {
        if (entry._id === 'plastique') plastiqueCount = entry.total;
        else if (entry._id === 'verre') verreCount = entry.total;
      });

      // Retourne les données sans les champs plastique et verre du niveau supérieur
      const poubelleData = poubelle.toObject();
      delete poubelleData.plastique; // Supprime le champ plastique du niveau supérieur
      delete poubelleData.verre;    // Supprime le champ verre du niveau supérieur

      return {
        ...poubelleData,
        bottles: {
          plastique: plastiqueCount,
          verre: verreCount
        }
      };
    }));

    res.json(result);
  } catch (err) {
    console.error('Erreur dans getPoubelles:', err);
    res.status(500).json({ message: err.message });
  }
};

// Supprimer une poubelle par ID
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

// Récupérer une poubelle par ID
exports.getPoubelleById = async (req, res) => {
  const poubelleId = req.params.id; // Récupère l'ID depuis l'URL

  try {
    // Recherche la poubelle par ID
    const poubelle = await Poubelle.findById(poubelleId);

    // Si la poubelle n'est pas trouvée
    if (!poubelle) {
      return res.status(404).json({ message: 'Poubelle non trouvée' });
    }

    // Si la poubelle est trouvée, renvoie-la
    res.status(200).json(poubelle);
  } catch (error) {
    console.error('Erreur lors de la récupération de la poubelle par ID:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// Mettre à jour une poubelle par ID
exports.updatePoubelle = async (req, res) => {
  const { poubelleId } = req.params;  // ID de la poubelle à mettre à jour
  const { name, latitude, longitude, firstname, lastname, plastique, verre } = req.body; // Données à mettre à jour

  try {
    // Vérifier si l'ID de la poubelle et les nouveaux champs sont fournis
    if (!poubelleId) {
      return res.status(400).json({ message: 'L\'ID de la poubelle est requis' });
    }

    // Trouver la poubelle par ID
    const poubelle = await Poubelle.findById(poubelleId);

    if (!poubelle) {
      return res.status(404).json({ message: 'Poubelle non trouvée' });
    }

    // Mettre à jour les champs de la poubelle avec les nouvelles valeurs
    if (name) poubelle.name = name;
    if (latitude) poubelle.latitude = latitude;
    if (longitude) poubelle.longitude = longitude;
    if (firstname) poubelle.firstname = firstname;
    if (lastname) poubelle.lastname = lastname;
    if (plastique !== undefined) poubelle.plastique = plastique; // On prend en compte les valeurs undefined
    if (verre !== undefined) poubelle.verre = verre; // On prend en compte les valeurs undefined

    // Mettre à jour les coordonnées (location)
    poubelle.location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    // Sauvegarder la poubelle mise à jour
    await poubelle.save();

    // Répondre avec la poubelle mise à jour
    res.status(200).json({
      message: 'Poubelle mise à jour avec succès',
      poubelle
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la poubelle:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// Trouver la poubelle la plus proche
exports.getNearestBin = async (req, res) => {
  try {
    const { lat, lng } = req.query;  // Récupérer les coordonnées de l'utilisateur

    // Validation des entrées
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Les paramètres lat et lng doivent être fournis et être des nombres valides.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    console.log(`Recherche de la poubelle la plus proche pour : lat=${latitude}, lng=${longitude}`);

    // Requête MongoDB pour trouver la poubelle la plus proche en utilisant $nearSphere
    const nearestBin = await Poubelle.findOne({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],  // longitude d'abord, puis latitude
          },
          $maxDistance: 10000  // distance maximum de recherche en mètres (10 km ici)
        }
      }
    });

    if (!nearestBin) {
      return res.status(404).json({ message: 'Aucune poubelle trouvée à proximité.' });
    }

    // Retourner le nom de la poubelle la plus proche
    return res.status(200).json({ name: nearestBin.name });

  } catch (error) {
    console.error('Erreur lors de la recherche de la poubelle la plus proche:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la recherche de la poubelle la plus proche.' });
  }
};




exports.updateLocationCoordinates = async (req, res) => {
  try {
    // Trouver toutes les poubelles qui n'ont pas de coordonnées dans 'location'
    const poubelles = await Poubelle.find({ "location.coordinates": { $exists: false } });

    if (poubelles.length === 0) {
      return res.status(404).json({ message: 'Aucune poubelle sans coordonnées trouvée.' });
    }

    // Ajouter les coordonnées à chaque poubelle
    for (let poubelle of poubelles) {
      const { latitude, longitude } = poubelle;
      poubelle.location = {
        type: "Point",
        coordinates: [longitude, latitude]  // Longitude en premier, Latitude en deuxième
      };
      await poubelle.save();
    }

    res.status(200).json({ message: 'Coordonnées ajoutées aux poubelles avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des coordonnées:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout des coordonnées aux poubelles.' });
  }
};