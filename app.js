const express = require("express");
const mongoose = require("mongoose");

const path = require("path");
const booksRoutes = require("./routes/books");
const userRoutes = require("./routes/user");
// Création de l'application Express
const app = express();

// Configuration de la connexion à la base de données MongoDB
require("dotenv").config();
const MongoUserName = process.env.MONGO_USER_NAME;
const MongoMdp = process.env.MONGO_MDP;
const MongoUrl = process.env.MONGO_URL;
mongoose
  .connect(`mongodb+srv://${MongoUserName}:${MongoMdp}${MongoUrl}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.log(error));

// Utilisation de JSON pour les requêtes entrantes
app.use(express.json());

// Configuration des en-têtes CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader("Vary", "Origin");

  next();
});

// Configuration des routes pour les livres et l'authentification
app.use("/api/books", booksRoutes);
app.use("/api/auth", userRoutes);

module.exports = { app };
