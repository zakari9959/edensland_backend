const { generatePresignedUrl } = require("../middleware/aws-s3");
const Book = require("../models/book");
const fs = require("fs");
exports.createBook = async (req, res, next) => {
  try {
    let imageUrlKey = null;

    if (req.file) {
      imageUrlKey = req.file.name;
    }

    const bookObject = JSON.parse(req.body.book);

    delete bookObject.userId;

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrlKey: imageUrlKey,
    });

    await book.save();

    res.status(201).json({ message: "Livre enregistré !" });
  } catch (error) {
    res
      .status(400)
      .json({
        error:
          error.message ||
          "Une erreur s'est produite lors de l'enregistrement du livre.",
      });
  }
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      if (book.userId != req.auth.userId) {
        return res
          .status(401)
          .json({ message: "Compte non autorisé à supprimer ce livre" });
      } else {
        Book.deleteOne({ _id: req.params.id })
          .then(() => {
            res.status(200).json({ message: "Livre supprimé !" });
          })
          .catch((error) => {
            console.error("Erreur lors de la suppression :", error);
            res
              .status(500)
              .json({ error: "Erreur lors de la suppression du livre" });
          });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la recherche du livre :", error);
      res.status(500).json({ error: "Erreur lors de la recherche du livre" });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBook = async (req, res, next) => {
  try {
    const books = await Book.find({ userId: req.auth.userId });
    console.log("livres", books);
    // Parcourir tous les livres et ajouter l'URL signée à chacun
    const booksWithSignedUrls = await Promise.all(
      books.map(async (book) => {
        book.imageUrlKey
          ? console.log(book.imageUrlKey)
          : console.log("no image url key");
        const signedUrl = await generatePresignedUrl(book.imageUrlKey);
        return {
          ...book.toObject(),
          imageUrl: signedUrl,
        };
      })
    );

    console.log("Livres récupérés avec succès :", booksWithSignedUrls);
    res.status(200).json(booksWithSignedUrls);
  } catch (error) {
    console.error("Erreur lors de la recherche des livres :", error);
    res.status(400).json({ error });
  }
};
