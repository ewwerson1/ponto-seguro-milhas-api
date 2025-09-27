const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha: String,
  "data-nascimento": String,
  telefone: String,
  cpf: String,
  cep: String,
  endereco: String,
  "numero-casa": String,
  complemento: String,
  bairro: String,
  estado: String,
  cidade: String,
  banco: String,
  agencia: String,
  "conta-corrente": String,
  digito: String,
  role: { type: String, enum: ["user", "admin"], default: "user" }
});

// método para comparar senha
userSchema.methods.matchPassword = async function (enteredPassword) {
  return enteredPassword === this.senha; // teste simples, sem hash
  // para produção: return await bcrypt.compare(enteredPassword, this.senha)
};

module.exports = mongoose.model("User", userSchema);
