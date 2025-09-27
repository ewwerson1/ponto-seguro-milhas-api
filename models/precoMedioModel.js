const mongoose = require("mongoose");

const precoMedioSchema = new mongoose.Schema(
  {
    programa: {
      type: String,
      enum: ["Latam Pass", "TudoAzul", "Smiles"],
      required: true,
      unique: true,
    },
    precoMedio: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrecoMedio", precoMedioSchema);
