const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Função de cadastro
const registerUser = async (req, res) => {
  try {
    const { nome, email, senha, telefone, cpf, endereco, role } = req.body;

    // Se não for enviado, cai no default ("user")
    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = await User.create({
      nome,
      email,
      senha: hashedPassword,
      telefone,
      cpf,
      endereco,
      role: role || "user"  // 👈 aqui
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role }, // 👈 inclui role no token
      process.env.JWT_SECRET || "SECRET_KEY_DO_JWT",
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      data: {
        id: newUser._id,
        nome: newUser.nome,
        email: newUser.email,
        role: newUser.role, // 👈
        token,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && user.matchPassword(senha)) {
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role }, // 👈 inclui role
        process.env.JWT_SECRET || "SECRET_KEY_DO_JWT",
        { expiresIn: "1d" }
      );

      res.json({
        success: true,
        data: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          role: user.role, // 👈
          token,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Email ou senha inválidos" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Rota GET /api/me
const getMe = async (req, res) => {
  try {
    const user = req.user; // definido pelo middleware
    res.json({
      success: true,
      id: user._id,
      nome: user.nome,
      email: user.email,
      cpf: user.cpf,
      usuario: user.nome, // ou outro campo de login
      banco: user.banco,
      agencia: user.agencia,
      "conta-corrente": user["conta-corrente"],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// update user
const updateUser = async (req, res) => {
  try {
    const userId = req.user._id; // vem do middleware de autenticação
    const {
      nome,
      email,
      telefone,
      cpf,
      endereco,
      banco,
      agencia,
      contaCorrente,
      titularConta,
    } = req.body;

    // busca e atualiza
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        nome,
        email,
        telefone,
        cpf,
        endereco,
        banco,
        agencia,
        contaCorrente,
        titularConta,
      },
      { new: true } // retorna o documento atualizado
    );

    res.json({
      success: true,
      message: "Dados atualizados com sucesso",
      data: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { loginUser, getMe, updateUser, registerUser };
