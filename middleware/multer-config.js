const multer = require("multer");

// Configure le stockage en mémoire pour les fichiers téléchargés
const uploadMulter = multer({ storage: multer.memoryStorage() }).single(
  "imageUrl"
);

module.exports = { uploadMulter };
