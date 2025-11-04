// CONTROLADOR DE PAGOS
const PagoService = require("../services/pagos.service");
const PagoModel = require("../models/pagos.model");
const HistorialService = require("../services/historial.service");

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
      const payload = Buffer.isBuffer(req.body)
        ? JSON.parse(req.body.toString("utf8"))
        : req.body;
      await PagoService.procesarWebhook(payload);
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

  // Actualizar estado manualmente (admin/super_admin)
  actualizarEstadoManual: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { estado, motivo } = req.body;
      const estadosPermitidos = ["pendiente", "aprobado", "rechazado"];

      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
          ok: false,
          error: "Estado inválido. Use: pendiente, aprobado o rechazado",
        });
      }

      const pago = await PagoModel.obtenerPorId(id);
      if (!pago) {
        return res.status(404).json({ ok: false, error: "Pago no encontrado" });
      }

      const rawJson = {
        manual_override: true,
        estado_anterior: pago.estado_pago,
        estado_nuevo: estado,
        motivo: motivo || null,
        por_usuario: req.user?.id_usuario || null,
        fecha: new Date().toISOString(),
      };

      await PagoModel.actualizarEstadoPorIdPago(Number(id), estado, rawJson);

      // Registrar en historial del pedido (si aplica)
      if (pago.id_pedido) {
        try {
          await HistorialService.registrarCambio(
            pago.id_pedido,
            `pago:${pago.estado_pago}`,
            `pago:${estado}`,
            req.user?.id_usuario || null,
            motivo || "Cambio manual de estado de pago"
          );
        } catch (e) {
          // No bloquear por fallo de registro de historial
          console.warn("Historial no registrado:", e?.message || e);
        }
      }

      res.json({
        ok: true,
        message: "Estado de pago actualizado manualmente",
        data: { id_pago: Number(id), estado },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = PagosController;