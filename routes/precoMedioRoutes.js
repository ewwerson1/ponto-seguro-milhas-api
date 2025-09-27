const express = require("express");
const router = express.Router();
const {
  listarPrecos,
  atualizarPreco,
  adicionarPreco,
} = require("../controllers/precoMedioController");
const { protect } = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

// GET /api/precos -> lista todos os preços
router.get("/", listarPrecos);

// POST /api/precos -> adiciona novo preço médio (somente admin)
router.post("/", protect, isAdmin, adicionarPreco);

// PUT /api/precos/:programa -> atualiza preço médio existente (somente admin)
router.put("/:programa", protect, isAdmin, atualizarPreco);

module.exports = router;