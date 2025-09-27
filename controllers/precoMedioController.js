const PrecoMedio = require("../models/precoMedioModel");

// GET - listar todos os preços
const listarPrecos = async (req, res) => {
  try {
    const precos = await PrecoMedio.find();
    res.json({ success: true, data: precos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST - adicionar novo preço médio (somente admin)
const adicionarPreco = async (req, res) => {
  try {
    const { programa, precoMedio } = req.body;

    if (!programa || precoMedio === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Programa e preço médio são obrigatórios" });
    }

    // Verifica se já existe
    const existente = await PrecoMedio.findOne({ programa });
    if (existente) {
      return res
        .status(400)
        .json({ success: false, message: "Programa já cadastrado" });
    }

    const novoPreco = await PrecoMedio.create({ programa, precoMedio });
    res.status(201).json({ success: true, data: novoPreco });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT - atualizar preço médio existente (somente admin)
const atualizarPreco = async (req, res) => {
  try {
    const { programa } = req.params;
    const { precoMedio } = req.body;

    if (precoMedio === undefined) {
      return res.status(400).json({ success: false, message: "Preço médio é obrigatório" });
    }

    const precoAtualizado = await PrecoMedio.findOneAndUpdate(
      { programa },
      { precoMedio },
      { new: true }
    );

    if (!precoAtualizado) {
      return res.status(404).json({ success: false, message: "Programa não encontrado" });
    }

    res.json({ success: true, data: precoAtualizado });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listarPrecos,
  adicionarPreco,
  atualizarPreco,
};
