const functions = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");

// Mercado Pago SDK v2
const { MercadoPagoConfig, Payment } = require("mercadopago");

// Tu token de MP
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ---------------
// WEBHOOK MERCADO PAGO
// ---------------
app.post("/pagos/callback", async (req, res) => {
  try {
    console.log("Webhook recibido:");
    console.log(JSON.stringify(req.body, null, 2));

    const evento = req.body;

    // MP envía: { data: { id: payment_id }, type: "payment" }
    const paymentId = evento?.data?.id;
    if (!paymentId) {
      console.log("⚠ Webhook sin paymentId");
      return res.sendStatus(200);
    }

    const payment = new Payment(client);
    const result = await payment.get({ id: paymentId });

    const pago = result.body;
    const externalRef = pago.external_reference;
    const estado = pago.status; // approved | pending | rejected

    console.log("Pago obtenido desde MP:", pago);

    // TODO: Llamar a tu backend principal para actualizar pedido/pago
    // Ejemplo con fetch:
    await fetch("https://localhost:3000/pagos/webhook-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentId,
        estado,
        externalRef,
        raw: pago,
      }),
    });

    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error procesando webhook:", err);
    return res.sendStatus(500);
  }
});

// Exportamos la API como Cloud Function
exports.api = functions.onRequest(app);
