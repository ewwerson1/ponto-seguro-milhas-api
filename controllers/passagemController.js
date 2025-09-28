const Passagem = require("../models/PassagemModel");

exports.createPassagem = async (req, res) => {
  try {
    const {
      passenger,
      idaFlight,
      voltaFlight,
      addLuggage,
      flightPrice,
      boardingFee,
      emissionFee,
      totalPrice,
      fromLocationName,
      toLocationName   
    } = req.body;

   const newPassagem = new Passagem({
      user: req.user._id,
      passenger,
      flight: { idaFlight, voltaFlight },
      baggage: { addLuggage },
      prices: { flightPrice, boardingFee, emissionFee, totalPrice },
      status: "Aguardando emissão",
      locations: {
        fromLocationName,
        toLocationName
      }
    });


    await newPassagem.save();

    res.status(201).json({
      message: "Passagem salva com sucesso!",
      passagem: newPassagem
    });
  } catch (error) {
    console.error("Erro ao salvar passagem:", error);
    res.status(500).json({ error: "Erro ao salvar passagem." });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const passagem = await Passagem.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json(passagem);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar status." });
  }
};

// Buscar passagens do usuário logado
exports.getPassagens = async (req, res) => {
  try {
    const passagens = await Passagem.find({ user: req.user._id }); // 🔹 busca só as dele
    res.json(passagens);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar passagens." });
  }
};
