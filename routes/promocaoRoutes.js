const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  criarPromocao,
  listarPromocoes,
  listarTodasPromocoes,
  atualizarPromocao,
  deletarPromocao
} = require("../controllers/promocaoController");

// Rotas admin
router.post("/", protect, criarPromocao); // criar promoção
router.get("/admin", protect, listarTodasPromocoes); // listar todas promoções (admin)
router.put("/:id", protect, atualizarPromocao); // atualizar promoção
router.delete("/:id", protect, deletarPromocao); // deletar promoção

// Rotas usuário
router.get("/", listarPromocoes); // listar apenas promoções confirmadas

module.exports = router;
