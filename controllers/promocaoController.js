const Promocao = require("../models/promocaoModel");

// Criar nova promoção
const criarPromocao = async (req, res) => {
  try {
    const novaPromo = new Promocao(req.body);
    await novaPromo.save();
    res.status(201).json(novaPromo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao criar promoção" });
  }
};

// Listar todas promoções confirmadas (frontend)
const listarPromocoes = async (req, res) => {
  try {
    const promocoes = await Promocao.find({ confirmada: true }).sort({ createdAt: -1 });
    res.status(200).json(promocoes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar promoções" });
  }
};

// Listar todas promoções (admin)
const listarTodasPromocoes = async (req, res) => {
  try {
    const promocoes = await Promocao.find().sort({ createdAt: -1 });
    res.status(200).json(promocoes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar promoções" });
  }
};

// Atualizar promoção
const atualizarPromocao = async (req, res) => {
  try {
    const promocao = await Promocao.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promocao) return res.status(404).json({ message: "Promoção não encontrada" });
    res.status(200).json(promocao);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar promoção" });
  }
};

// Deletar promoção
const deletarPromocao = async (req, res) => {
  try {
    const promocao = await Promocao.findByIdAndDelete(req.params.id);
    if (!promocao) return res.status(404).json({ message: "Promoção não encontrada" });
    res.status(200).json({ message: "Promoção deletada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao deletar promoção" });
  }
};

module.exports = {
  criarPromocao,
  listarPromocoes,
  listarTodasPromocoes,
  atualizarPromocao,
  deletarPromocao
};
