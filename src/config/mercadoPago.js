// CONFIGURACIÓN MERCADO PAGO (SDK v2)
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
require("dotenv").config();

// Inicializa el cliente con el token de acceso
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

console.log("🟢 Token de MP cargado:", process.env.MERCADOPAGO_ACCESS_TOKEN);

module.exports = { client, Preference, Payment };
