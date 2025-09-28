const mongoose = require("mongoose");

const passagemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  passenger: {
    firstName: String,
    lastName: String,
    nationality: String,
    gender: String,
    birthDate: String,
    cpf: String
  },
  flight: {
    idaFlight: Object,
    voltaFlight: Object
  },
  baggage: {
    addLuggage: Boolean
  },
  prices: {
    flightPrice: Number,
    boardingFee: Number,
    emissionFee: Number,
    totalPrice: Number
  },
  locations: {  // 🔹 adiciona aqui
    fromLocationName: String,
    toLocationName: String
  },
  status: {
    type: String,
    default: "Aguardando emissão"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Passagem", passagemSchema);

