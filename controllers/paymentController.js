require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Passagem = require("../models/PassagemModel");

exports.createCheckoutSession = async (req, res) => {
  try {
    const {
      passenger,
      idaFlight,
      voltaFlight,
      addLuggage,
      flightPrice,
      boardingFee,
      emissionFee,
      totalPrice
    } = req.body;

    // 🔹 Cria passagem no banco já associada ao usuário
    const newPassagem = new Passagem({
      user: req.user._id,
      passenger,
      flight: { idaFlight, voltaFlight },
      baggage: { addLuggage },
      prices: { flightPrice, boardingFee, emissionFee, totalPrice },
      status: "Aguardando pagamento"
    });

    await newPassagem.save();

    // 🔹 Só manda o ID pro Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { name: "Passagem aérea" },
            unit_amount: totalPrice * 100
          },
          quantity: 1
        }
      ],
      success_url: "http://localhost:5173/minha-conta",
      cancel_url: "http://localhost:5173/cancelado",
      metadata: {
        passagemId: newPassagem._id.toString()
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Erro ao criar sessão Stripe:", err);
    res.status(500).json({ error: "Erro ao criar sessão do Stripe" });
  }
};
