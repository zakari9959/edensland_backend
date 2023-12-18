const sharp = require("sharp");
const fs = require("fs");

// Middleware pour la compression et le redimensionnement de l'image
const sharpCompressResize = async (req, res, next) => {
  if (req.file) {
    const { buffer, originalname } = req.file;

    const timestamp = Date.now();
    const nameWithoutExtension = originalname.split(".")[0];
    const ref = `${timestamp}-${nameWithoutExtension}.webp`;

    const compressedImage = await sharp(buffer)
      .resize({ width: 400, height: 500 })
      .webp({ quality: 80 })
      .toBuffer();
    req.file.buffer = compressedImage;
    req.file.name = ref;
  }
  next();
};

module.exports = sharpCompressResize;
