const express = require("express");
const router = express.Router();
const passagemController = require("../controllers/passagemController");
const { protect } = require("../middleware/authMiddleware");

// Rotas de passagem (protegidas por token)
router.post("/", protect, passagemController.createPassagem);
router.get("/", protect, passagemController.getPassagens);

module.exports = router;
