const FacturacionService = require("../services/factura.service");
const OrdersService = require("../services/orders.service");
const FacturaModel = require("../models/factura.model");

const FacturacionController = {
  /**
   * Emite una factura para el pedido indicado.
   * Requiere rol admin/super_admin.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
  async emitirFactura(req, res, next) {
    try {
      const { id_pedido } = req.params;
      const pedido = await OrdersService.getOrderById(id_pedido);

      if (!pedido)
        return res
          .status(404)
          .json({ ok: false, error: "Pedido no encontrado" });

      const factura = await FacturacionService.generarFactura(
        pedido.pedido,
        pedido.pedido.metodo_pago
      );
      res.status(201).json({ ok: true, data: factura });
    } catch (err) {
      next(err);
    }
  },
  
  /**
   * Obtiene una factura por su ID.
   * Requiere rol admin/super_admin.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
  async obtenerFacturaPorId(req, res, next) {
    try {
      const { id } = req.params;
      const factura = await FacturaModel.obtenerPorId(id);
      if (!factura) return res.status(404).json({ ok: false, error: "Factura no encontrada" });
      res.json({ ok: true, data: factura });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Obtiene la factura asociada a un pedido por ID de pedido.
   * Requiere rol admin/super_admin.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
  async obtenerFacturaPorPedido(req, res, next) {
    try {
      const { id_pedido } = req.params;
      const factura = await FacturaModel.obtenerPorPedido(id_pedido);
      if (!factura) return res.status(404).json({ ok: false, error: "Factura no encontrada para el pedido" });
      res.json({ ok: true, data: factura });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = FacturacionController;
