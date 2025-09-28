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
      totalPrice,
      fromLocationName,
      toLocationName
    } = req.body;

    console.log("REQ.BODY:", req.body);
    console.log("REQ.USER:", req.user);

    // Verifica usuário autenticado
    if (!req.user?._id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    // Valida totalPrice
    if (totalPrice == null || isNaN(totalPrice)) {
      return res.status(400).json({ error: "totalPrice inválido" });
    }

    // Cria passagem no banco
    const newPassagem = new Passagem({
      user: req.user._id,
      passenger: passenger || {},
      flight: { idaFlight: idaFlight || {}, voltaFlight: voltaFlight || {} },
      baggage: { addLuggage: !!addLuggage },
      prices: { 
        flightPrice: flightPrice || 0, 
        boardingFee: boardingFee || 0, 
        emissionFee: emissionFee || 0, 
        totalPrice 
      },
      locations: { 
        fromLocationName: fromLocationName || "", 
        toLocationName: toLocationName || "" 
      },
      status: "Aguardando pagamento"
    });

    await newPassagem.save();

    // Cria sessão Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: { name: "Passagem aérea" },
              unit_amount: Math.round(totalPrice * 100)
            },
            quantity: 1
          }
        ],
        success_url: "http://localhost:5173/minha-conta",
        cancel_url: "http://localhost:5173/cancelado",
        metadata: { passagemId: newPassagem._id.toString() }
      });
    } catch (stripeErr) {
      console.error("Erro Stripe:", stripeErr);
      return res.status(500).json({ error: "Erro ao criar sessão no Stripe", details: stripeErr.message });
    }

    res.json({ url: session.url });

  } catch (err) {
    console.error("Erro ao criar passagem:", err);
    res.status(500).json({ error: "Erro ao criar passagem ou sessão do Stripe" });
  }
};
