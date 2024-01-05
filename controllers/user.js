const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  User.findOne({ email: req.body.email }).then((existingUser) => {
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Cette adresse e-mail est déjà utilisée." });
    }
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          email: req.body.email,
          password: hash,
        });
        user
          .save()
          .then(() => res.status(201).json({ message: "Utilisateur créé" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  });
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user === null) {
        res
          .status(401)
          .json({ message: "Identifiant/mot de passe incorrecte" });
      } else {
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              res
                .status(401)
                .json({ message: "Identifiant/mot de passe incorrect" });
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                  { userId: user._id },
                  process.env.RANDOM_TOKEN_SECRET,
                  {
                    expiresIn: "4h",
                  }
                ),
              });
            }
          })
          .catch((error) => {
            console.error(
              "Erreur lors de la comparaison de mots de passe :",
              error
            );
            res.status(500).json({
              error,
              message:
                "Erreur interne du serveur lors de la comparaison des mots de passe",
            });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ error, message: "utilisateur non trouvé" });
    });
};

exports.getAllUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      console.log("Error fetching users:", error);
      res.status(500).json({ error });
    });
};
