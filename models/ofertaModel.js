const mongoose = require('mongoose');

const ofertaSchema = new mongoose.Schema(
  {
    prazo: { type: String, required: true },
    milhas: { type: Number, required: true },
    valor: { type: Number, required: true },

    cia: { type: String, required: true }, // Companhia aérea
    programa: { type: String, required: true }, // Programa de fidelidade

    cpf: { type: String, required: true },
    nome: { type: String, required: true },
    banco: { type: String, required: true },
    agencia: { type: String, required: true },
    conta: { type: String, required: true },
    cpfTitular: { type: String, required: true },

    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    status: {
      type: String,
      enum: ["Em análise", "Aprovado", "Rejeitado", "Milhas recebidas", "Pagamento enviado"],
      default: "Em análise"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Oferta', ofertaSchema);
