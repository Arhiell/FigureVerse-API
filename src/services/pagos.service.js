// SERVICIO DE PAGOS (interacción con SDK)
const { client, Preference, Payment } = require("../config/mercadoPago");
const PagoModel = require("../models/pagos.model");

const PagoService = {
  // Crear una preferencia de pago y registrar en la BD
  iniciarPago: async (pedidoData) => {
    const preferenceBody = {
      items: [
        {
          title: `Pedido #${pedidoData.id_pedido}`,
          quantity: 1,
          currency_id: "ARS",
          unit_price: pedidoData.monto,
        },
      ],
      back_urls: {
        success: process.env.FRONTEND_SUCCESS_URL,
        failure: process.env.FRONTEND_FAILURE_URL,
        pending: process.env.FRONTEND_PENDING_URL,
      },
      auto_return: "approved",
      notification_url: process.env.WEBHOOK_URL, // webhook
      external_reference: String(pedidoData.id_pedido),
    };

    // Crear la preferencia en Mercado Pago (SDK v2)
    const preference = new Preference(client);
    const response = await preference.create({ body: preferenceBody });
    const prefId = response?.id || response?.body?.id;
    const raw = response?.body || response;

    // Registrar pago pendiente en la BD y devolver id_pago
    const idPago = await PagoModel.crear(
      pedidoData.id_pedido,
      "mercado_pago",
      pedidoData.monto,
      prefId,
      raw
    );

    return { ...raw, id_pago: idPago };
  },

  // Actualizar estado al recibir webhook
  procesarWebhook: async (data) => {
    try {
      const idTransaccion = data?.data?.id || data?.id;

      // Recuperar el pago desde Mercado Pago (SDK v2)
      const payment = new Payment(client);
      const result = await payment.get({ id: idTransaccion });
      const estado = result?.status || result?.body?.status; // "approved", "pending", "rejected"
      const rawPayment = result?.body || result;

      // Intento mapear por external_reference (id_pedido)
      const externalRef = rawPayment?.external_reference;
      if (externalRef) {
        await PagoModel.actualizarEstadoPorPedido(Number(externalRef), estado, rawPayment);
      } else {
        // Fallback: actualizar por id_transaccion (payment id)
        await PagoModel.actualizarEstado(idTransaccion, estado, rawPayment);
      }
    } catch (error) {
      console.error("Error procesando webhook:", error);
    }
  },
};

module.exports = PagoService;
