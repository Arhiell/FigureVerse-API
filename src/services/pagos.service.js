// SERVICIO DE PAGOS (interacción con SDK)
const { client, Preference, Payment } = require("../config/mercadoPago");
const PagoModel = require("../models/pagos.model");
const OrdersService = require("../services/orders.service");
const EnviosService = require("../services/envios.service");
const FacturacionService = require("../services/factura.service");

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
    console.log("WEBHOOK RECIBIDO:", JSON.stringify(data, null, 2));
    try {
      const idTransaccion =
      data.paymentId ||
      data?.data?.id ||
      data?.id;

      if (tipo !== "payment") {
      console.log("Webhook ignorado (tipo no soportado):", tipo);
      return;
      }

      // Recuperar el pago desde Mercado Pago (SDK v2)
      const estado = data.estado || data?.status; // "approved", "pending", "rejected"
      const rawPayment = result?.body || result;

      // Intento mapear por external_reference (id_pedido)
       const externalRef = data.externalRef || data?.external_reference;
      if (externalRef) {
        const id_pedido = Number(externalRef);
        await PagoModel.actualizarEstadoPorPedido(id_pedido, estado, rawPayment);

        // Automatismos si el estado implica pago aprobado
        if (estado === "approved" || estado === "aprobado") {
          try {
            // Actualizar estado del pedido a 'pagado'
            await OrdersService.updateOrderStatus(
              id_pedido,
              null,
              "pagado",
              "Actualización automática por webhook de pago aprobado"
            );

            // Crear envío para el pedido (si no existe)
            await EnviosService.crearEnvio({ id_pedido });

            // Emitir factura y enviar email
            const pedidoCompleto = await OrdersService.getOrderById(id_pedido);
            await FacturacionService.generarFactura(
              pedidoCompleto.pedido,
              "Mercado Pago"
            );
          } catch (autoErr) {
            console.warn("Automatismos post-aprobación con errores:", autoErr?.message || autoErr);
          }
        }
      } else {
        // Fallback: actualizar por id_transaccion (payment id)
        await PagoModel.actualizarEstado(idTransaccion, estado, rawPayment);
        // Nota: sin external_reference no podemos inferir id_pedido de forma confiable aquí.
      }
    } catch (error) {
      console.error("Error procesando webhook:", error);
    }
  },
};

module.exports = PagoService;
