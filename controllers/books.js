const { generatePresignedUrl } = require("../middleware/aws-s3");
const Book = require("../models/book");
const fs = require("fs");

exports.createBook = async (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject.userId;
  console.log(bookObject);
  console.log(req.file.name);
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrlKey: req.file.name,
  });
  console.log(book);
  book
    .save()
    .then(() => {
      console.log("okok", book);
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.name
        }`,
      }
    : { ...req.body };
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        if (req.file && book.imageUrl) {
          const imagePath = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${imagePath}`, (err) => {
            if (err) {
              console.error(err);
            }
          });
        }
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Livre modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
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
            console.log("Livre supprimé avec succès !");
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
