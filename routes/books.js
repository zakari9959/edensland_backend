const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const bookCtrl = require("../controllers/books");
const upload = require("../middleware/multer-config");
const sharp = require("../middleware/sharp");

router.get("/", auth, bookCtrl.getAllBook);
router.get("/:id", auth, bookCtrl.getOneBook);
router.post("/", auth, upload.single("imageUrl"), sharp, bookCtrl.createBook);
router.put("/:id", auth, upload.single("imageUrl"), sharp, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
