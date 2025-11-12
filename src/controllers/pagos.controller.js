// CONTROLADOR DE PAGOS
const PagoService = require("../services/pagos.service");
const PagoModel = require("../models/pagos.model");
const HistorialService = require("../services/historial.service");
const EnviosService = require("../services/envios.service");
const OrdersService = require("../services/orders.service");
const FacturacionService = require("../services/factura.service");
const { publishEvent } = require("../lib/publishEvent");

const PagosController = {
  // Listar todos los pagos (admin/super_admin)
  /**
   * Lista todos los pagos registrados en el sistema.
   * Requiere rol admin/super_admin.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
  listarPagos: async (req, res, next) => {
    try {
      const pagos = await PagoModel.listar();
      res.json({ ok: true, data: pagos });
    } catch (error) {
      next(error);
    }
  },

  // Listar pagos pendientes (admin/super_admin)
  /**
   * Lista los pagos con estado "pendiente".
   * Requiere rol admin/super_admin.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
  listarPendientes: async (req, res, next) => {
    try {
      const pagos = await PagoModel.listarPorEstado("pendiente");
      res.json({ ok: true, data: pagos });
    } catch (error) {
      next(error);
    }
  },
  // Inicia el proceso de pago (cliente)
  /**
   * Crea una preferencia de pago para un pedido y registra el pago pendiente.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
  createPayment: async (req, res, next) => {
    try {
      const { id_pedido, monto } = req.body;
      const pref = await PagoService.iniciarPago({ id_pedido, monto });

      try {
        await publishEvent({
          event: "PaymentInitiated",
          payload: {
            id_pago: pref?.id_pago || null,
            id_pedido,
            monto,
            preference_id: pref?.id || pref?.body?.id || null,
            init_point: pref?.init_point || pref?.body?.init_point || null,
            sandbox_init_point: pref?.sandbox_init_point || pref?.body?.sandbox_init_point || null,
          },
        });
      } catch (_) {}
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
  /**
   * Procesa el webhook de Mercado Pago. No requiere autenticación.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
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
  /**
   * Devuelve los datos de un pago por id_pago.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
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
  /**
   * Actualiza manualmente el estado de un pago y dispara automatismos si queda aprobado.
   * Automatismos: actualizar pedido a 'pagado', crear envío y emitir factura.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
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

      // Si el pago queda aprobado, disparar automatismos: actualizar pedido, crear envío y emitir factura
      let automatismos = {};
      if (estado === "aprobado" && pago.id_pedido) {
        try {
          // Actualizar estado del pedido a 'pagado'
          await OrdersService.updateOrderStatus(
            pago.id_pedido,
            req.user?.id_usuario || null,
            "pagado",
            "Actualización automática por pago aprobado"
          );

          // Crear envío (si no existe)
          const envio = await EnviosService.crearEnvio({ id_pedido: pago.id_pedido });
          automatismos.envio = envio;

          // Emitir factura y enviar email
          const pedidoCompleto = await OrdersService.getOrderById(pago.id_pedido);
          const factura = await FacturacionService.generarFactura(
            pedidoCompleto.pedido,
            "Mercado Pago"
          );
          automatismos.factura = { id_factura: factura.id_factura, numero_factura: factura.numero_factura };
        } catch (autoErr) {
          automatismos.error = autoErr?.message || String(autoErr);
        }
      }

      // Publicar eventos según nuevo estado
      try {
        if (estado === "aprobado") {
          await publishEvent({
            event: "PaymentApproved",
            payload: {
              id_pago: Number(id),
              id_pedido: pago.id_pedido || null,
              monto: pago.monto || null,
              fecha: new Date().toISOString(),
            },
          });
        } else if (estado === "rechazado") {
          await publishEvent({
            event: "PaymentFailed",
            payload: {
              id_pago: Number(id),
              id_pedido: pago.id_pedido || null,
              motivo: motivo || null,
              fecha: new Date().toISOString(),
            },
          });
        } else if (estado === "pendiente") {
          await publishEvent({
            event: "PaymentInitiated",
            payload: {
              id_pago: Number(id),
              id_pedido: pago.id_pedido || null,
              fecha: new Date().toISOString(),
            },
          });
        }
      } catch (_) {}

      res.json({
        ok: true,
        message: "Estado de pago actualizado manualmente",
        data: { id_pago: Number(id), estado, automatismos },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = PagosController;
