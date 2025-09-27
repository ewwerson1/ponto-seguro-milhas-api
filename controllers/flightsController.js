const axios = require("axios");
const qs = require("qs");

const TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
const FLIGHTS_API = "https://test.api.amadeus.com/v2/shopping/flight-offers";
const LOCATIONS_API = "https://test.api.amadeus.com/v1/reference-data/locations";

const CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

let tokenCache = null;
let tokenExpiry = null;

// Função para obter token da Amadeus
async function getAccessToken() {
  if (tokenCache && tokenExpiry > Date.now()) return tokenCache;

  const body = qs.stringify({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await axios.post(TOKEN_URL, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  tokenCache = response.data.access_token;
  tokenExpiry = Date.now() + response.data.expires_in * 1000 - 5000;
  return tokenCache;
}

// Buscar voos
exports.searchFlights = async (req, res) => {
  try {
    const from = req.query.from?.toUpperCase();
    const to = req.query.to?.toUpperCase();
    if (!from || !to || from.length !== 3 || to.length !== 3) {
      return res.status(400).json({ error: "Códigos IATA inválidos" });
    }

    const token = await getAccessToken();
    const params = {
      originLocationCode: from,
      destinationLocationCode: to,
      departureDate: req.query.departureDate,
      adults: req.query.adults,
      currencyCode: "BRL",
    };
    if (req.query.returnDate) params.returnDate = req.query.returnDate;

    const { data } = await axios.get(FLIGHTS_API, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    const uniqueFlights = [];
    const seen = new Set();

    (data.data || []).forEach(flight => {
      const key = flight.itineraries
        .map(i => i.segments.map(s => s.departure.iataCode + s.arrival.iataCode).join("-"))
        .join("|");

      if (!seen.has(key)) {
        seen.add(key);

        const traveler = flight.travelerPricings?.[0];
        let amadeusTaxes = traveler?.price?.taxes?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;
        if (amadeusTaxes === 0) amadeusTaxes = Math.floor(Math.random() * (680 - 540 + 1)) + 540;

        const ticketingFee = 120;
        const totalWithTaxes = parseFloat(traveler?.price?.total || 0) + amadeusTaxes + ticketingFee;

        flight.price = {
          total: parseFloat(traveler?.price?.total || 0),
          taxes: amadeusTaxes,
          ticketingFee,
          totalWithTaxes,
          currency: traveler?.price?.currency || "BRL"
        };

        uniqueFlights.push(flight);
      }
    });

    // Separar corretamente ida e volta
    if (req.query.returnDate) {
      global.flightsCacheIda = uniqueFlights.map(f => ({
        ...f,
        itineraries: [f.itineraries[0]] // só ida
      }));

      global.flightsCacheVolta = uniqueFlights.map(f => ({
        ...f,
        itineraries: [f.itineraries[1]] // só volta
      })).filter(f => f.itineraries[0]);
    } else {
      global.flightsCacheIda = uniqueFlights;
      global.flightsCacheVolta = [];
    }

    res.json({ ...data, data: uniqueFlights });
  } catch (err) {
    console.error("Erro ao buscar voos:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao buscar voos" });
  }
};

// Buscar voos por IDs para página de compra
exports.getFlightsByIds = async (req, res) => {
  try {
    const { idaFlightId, voltaFlightId } = req.body;
    if (!idaFlightId || !voltaFlightId) {
      return res.status(400).json({ error: "É necessário informar idaFlightId e voltaFlightId" });
    }

    const idaFlight = (global.flightsCacheIda || []).find(f => f.id == idaFlightId);
    const voltaFlight = (global.flightsCacheVolta || []).find(f => f.id == voltaFlightId);

    if (!idaFlight || !voltaFlight) {
      return res.status(404).json({ error: "Voos não encontrados no cache. Faça uma busca antes." });
    }

    const totalPrice = idaFlight.price.totalWithTaxes + voltaFlight.price.totalWithTaxes;

    res.json({ idaFlight, voltaFlight, totalPrice });
  } catch (err) {
    console.error("Erro ao buscar voos por IDs:", err.message);
    res.status(500).json({ error: "Erro ao buscar voos por IDs" });
  }
};

// Autocomplete de aeroportos
exports.searchAirports = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    if (!keyword) return res.status(400).json({ error: "É necessário fornecer 'keyword'" });

    const token = await getAccessToken();

    // Buscar aeroportos e cidades
    const { data } = await axios.get(LOCATIONS_API, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        keyword,
        subType: "AIRPORT,CITY",
        page: { limit: 10 },
      },
    });

    const locationsArray = Array.isArray(data.data) ? data.data : [];

    const results = locationsArray.map(a => ({
      iataCode: a.iataCode || "",
      name: a.name || "",
      city: a.address?.cityName || a.cityCode || a.iataCode || "",
      country: a.address?.countryCode || "",
    }));

    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar aeroportos:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao buscar aeroportos" });
  }
};
