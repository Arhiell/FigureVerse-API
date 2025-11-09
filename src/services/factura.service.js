const FacturaModel = require("../models/factura.model");
const { enviarFacturaEmail } = require("../services/mailerFactura.service");

/**
 * Normaliza el método de pago a los valores permitidos por el ENUM de la BD.
 * Acepta variantes comunes de entrada ("Mercado Pago", "mercadopago", "mp")
 * y devuelve el valor en snake_case definido en la tabla `facturas`.
 *
 * @param {string} valor - Método de pago recibido desde pedido o integraciones.
 * @returns {('mercado_pago'|'transferencia'|'tarjeta'|'efectivo')} Método normalizado.
 */
function normalizarMetodoPago(valor) {
  const raw = (valor || "").toString().toLowerCase().trim();
  const mapa = {
    "mercado pago": "mercado_pago",
    "mercadopago": "mercado_pago",
    "mp": "mercado_pago",
    "mercado_pago": "mercado_pago",
    transferencia: "transferencia",
    tarjeta: "tarjeta",
    efectivo: "efectivo",
  };
  return mapa[raw] || "mercado_pago";
}

const FacturacionService = {
  /**
   * Genera una factura para un pedido dado, calcula IVA y total,
   * normaliza el método de pago y envía el comprobante por email si hay destinatario.
   *
   * @param {{ id_pedido:number, subtotal:string|number, email?:string, email_cliente?:string }} pedido - Datos principales del pedido.
   * @param {string} [metodo_pago] - Método de pago utilizado en el pedido.
   * @returns {Promise<object>} La factura creada, tal como queda almacenada en la BD.
   */
  async generarFactura(pedido, metodo_pago) {
    // Calcular IVA (21%)
    const subtotalNum = Number(pedido.subtotal);
    const iva_monto = subtotalNum * 0.21;
    const total = subtotalNum + iva_monto;

    // Asegurar método de pago válido según ENUM
    const metodoPagoFinal = normalizarMetodoPago(metodo_pago);

    // Crear factura
    const factura = await FacturaModel.crearFactura({
      id_pedido: pedido.id_pedido,
      subtotal: subtotalNum,
      iva_monto,
      total,
      metodo_pago: metodoPagoFinal,
    });

    // Resolver email del cliente desde datos del pedido
    const emailDest = pedido.email || pedido.email_cliente;

    // Enviar factura por correo, sin bloquear si falla
    if (emailDest) {
      try {
        await enviarFacturaEmail(emailDest, factura);
      } catch (err) {
        // No bloquear la emisión de la factura por error de envío de email
        // Se podría loguear si hay un logger disponible
      }
    }

    return factura;
  },
};

module.exports = FacturacionService;
