const mongoose = require("mongoose");

const promocaoSchema = new mongoose.Schema(
  {
    destino: { type: String, required: true },
    precoPromocional: { type: Number, required: true },
    imagem: { type: String },
    data: { type: String, required: true },
    confirmada: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promocao", promocaoSchema);
