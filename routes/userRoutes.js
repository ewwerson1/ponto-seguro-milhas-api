const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const { protect } = require("../middleware/authMiddleware"); // verifica token JWT
const isAdmin = require("../middleware/isAdmin"); // <-- movi pra cima
const { loginUser, registerUser } = require("../controllers/userController");

// POST /api/user/login -> login do usuário
router.post("/login", loginUser);

// Rota de cadastro
router.post("/register", registerUser);

// Lista todos os usuários (somente admin)
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-senha"); // exclui o campo senha
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/user/me  -> retorna os dados do usuário logado
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado" });
    }

    // 🔹 Normaliza os nomes dos campos antes de mandar para o frontend
    res.json({
      success: true,
      data: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        cpf: user.cpf,
        dataNascimento: user["data-nascimento"],
        cep: user.cep,
        endereco: user.endereco,
        numeroCasa: user["numero-casa"],
        complemento: user.complemento,
        bairro: user.bairro,
        estado: user.estado,
        cidade: user.cidade,
        titularConta: user.titularConta,
        banco: user.banco,
        agencia: user.agencia,
        contaCorrente: user["conta-corrente"],
        digito: user.digito,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Rota apenas para admins: listar ofertas
router.get("/ofertas", protect, isAdmin, async (req, res) => {
  const ofertas = await Oferta.find();
  res.json(ofertas);
});

// PUT /api/user/me -> atualiza os dados do usuário logado
router.put("/me", protect, async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      cpf,
      dataNascimento,
      cep,
      endereco,
      numeroCasa,
      complemento,
      bairro,
      estado,
      cidade,
      titularConta,
      banco,
      agencia,
      contaCorrente,
      digito,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id, // usa o id do token
      {
        nome,
        email,
        telefone,
        cpf,
        "data-nascimento": dataNascimento,
        cep,
        endereco,
        "numero-casa": numeroCasa,
        complemento,
        bairro,
        estado,
        cidade,
        titularConta,
        banco,
        agencia,
        "conta-corrente": contaCorrente,
        digito,
      },
      { new: true } // retorna já atualizado
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado" });
    }

    res.json({
      success: true,
      message: "Dados atualizados com sucesso",
      data: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        cpf: user.cpf,
        dataNascimento: user["data-nascimento"],
        cep: user.cep,
        endereco: user.endereco,
        numeroCasa: user["numero-casa"],
        complemento: user.complemento,
        bairro: user.bairro,
        estado: user.estado,
        cidade: user.cidade,
        titularConta: user.titularConta,
        banco: user.banco,
        agencia: user.agencia,
        contaCorrente: user["conta-corrente"],
        digito: user.digito,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
