// CONTROLADOR DE PAGOS
const PagoService = require("../services/pagos.service");
const PagoModel = require("../models/pagos.model");

const PagosController = {
  // Inicia el proceso de pago (cliente)
  createPayment: async (req, res, next) => {
    try {
      const { id_pedido, monto } = req.body;
      const pref = await PagoService.iniciarPago({ id_pedido, monto });
      res.status(201).json({
        ok: true,
        message: "Preferencia de pago creada exitosamente.",
        id_pago: pref?.id_pago,
        preference_id: pref?.id || pref?.body?.id,
        init_point: pref?.init_point || pref?.body?.init_point,
        sandbox_init_point:
          pref?.sandbox_init_point || pref?.body?.sandbox_init_point,
      });
    } catch (error) {
      next(error);
    }
  },

  // Recibe el webhook desde Mercado Pago
  recibirWebhook: async (req, res) => {
    try {
      await PagoService.procesarWebhook(req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error en webhook:", error);
      res.sendStatus(500);
    }
  },

  // Consultar estado de un pago
  obtenerPago: async (req, res, next) => {
    try {
      const pago = await PagoModel.obtenerPorId(req.params.id);
      if (!pago)
        return res.status(404).json({ ok: false, error: "Pago no encontrado" });
      res.json({ ok: true, data: pago });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = PagosController;
