const FacturacionService = require("../services/facturacion.service");
const OrdersService = require("../services/orders.service");

const FacturacionController = {
  async emitirFactura(req, res, next) {
    try {
      const { id_pedido } = req.params;
      const pedido = await OrdersService.getOrderById(id_pedido);

      if (!pedido) return res.status(404).json({ ok: false, error: "Pedido no encontrado" });

      const factura = await FacturacionService.generarFactura(pedido.pedido, pedido.pedido.metodo_pago);
      res.status(201).json({ ok: true, data: factura });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = FacturacionController;
