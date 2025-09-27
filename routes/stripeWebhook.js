// routes/stripeWebhook.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Passagem = require("../models/PassagemModel");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const passagemId = session.metadata.passagemId;

      try {
        await Passagem.findByIdAndUpdate(passagemId, { status: "Pago" });
        console.log("✅ Passagem atualizada para 'Pago'");
      } catch (err) {
        console.error("Erro ao atualizar passagem:", err);
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
