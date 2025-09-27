const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const ofertaRoutes = require('./routes/ofertaRoutes');
const flightsRoutes = require('./routes/flightsRoutes');
const userRoutes = require('./routes/userRoutes');
const promocaoRoutes = require('./routes/promocaoRoutes');
const passagemRoutes = require('./routes/passagemRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const stripeWebhook = require("./routes/stripeWebhook");
const precoRoutes = require("./routes/precoMedioRoutes");
const app = express();
app.use(cors());
app.use("/api/stripe", stripeWebhook);
app.use(bodyParser.json());
app.use("/api/payments", paymentRoutes);
app.use("/api/user", userRoutes);
app.use('/api', ofertaRoutes);
app.use('/api/promocoes', promocaoRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/passagens', passagemRoutes);
app.use("/api/precos", precoRoutes);

// Conexão MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB conectado'))
.catch(err => console.log('Erro ao conectar MongoDB:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
