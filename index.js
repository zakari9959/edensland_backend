const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const booksRoutes = require("./routes/books");
const userRoutes = require("./routes/user");
const serverless = require("serverless-http");
const app = express();

const memoryStorage = [];

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

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
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

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/books", booksRoutes);
app.use("/api/auth", userRoutes);

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const port = normalizePort(process.env.PORT || "4000");
app.set("port", port);

// Modification pour Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  });
} else {
  module.exports.handler = serverless(app);
}
