const express = require("express");
const router = express.Router();

const { searchFlights, getFlightsByIds, searchAirports } = require("../controllers/flightsController");

// Busca voos via Amadeus
router.get("/search", searchFlights);

// Busca voos selecionados pelo ID (para a página de compra)
router.post("/getFlightsByIds", getFlightsByIds);

// Autocomplete de aeroportos
router.get("/airports", searchAirports);

module.exports = router;
