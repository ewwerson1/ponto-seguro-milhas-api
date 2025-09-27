const express = require('express');
const {
  salvarOferta,
  listarOfertas,
  listarTodasOfertas,
  updateStatusOferta,
  deletarOferta,
  listarRanking
} = require('../controllers/ofertaController');

const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Rotas do usuário
router.post('/oferta', protect, salvarOferta);
router.get('/ofertas', protect, listarOfertas);
router.delete('/oferta/:id', protect, deletarOferta); // nova rota de exclusão

// Rotas admin
router.get('/admin/ofertas', protect, listarTodasOfertas);
router.put('/oferta/:id', protect, updateStatusOferta);

// Ranking
router.get('/ofertas/ranking', listarRanking);

module.exports = router;
