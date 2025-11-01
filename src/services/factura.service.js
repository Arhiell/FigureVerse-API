const FacturaModel = require("../models/facturas.model");
const { enviarFacturaEmail } = require("./mailerFactura.service");

const FacturacionService = {
  async generarFactura(pedido, metodo_pago) {
    // Calcular IVA (21%)
    const iva_monto = pedido.subtotal * 0.21;
    const total = pedido.subtotal + iva_monto;

    // Crear factura
    const factura = await FacturaModel.crearFactura({
      id_pedido: pedido.id_pedido,
      subtotal: pedido.subtotal,
      iva_monto,
      total,
      metodo_pago,
    });

    // Enviar factura por correo
    await enviarFacturaEmail(pedido.email_cliente, factura);

    return factura;
  },
};

module.exports = FacturacionService;     
