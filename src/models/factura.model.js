const pool = require("../config/db");
const crypto = require("crypto");

const FacturaModel = {
  async crearFactura({ id_pedido, tipo_factura = "B", subtotal, iva_monto, total, metodo_pago }) {
    const numero_factura = `FV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const hash_verificacion = crypto.createHash("sha256").update(`${id_pedido}-${total}`).digest("hex");

    const [result] = await pool.query(
      `INSERT INTO facturas 
      (id_pedido, numero_factura, tipo_factura, subtotal, iva_monto, total, metodo_pago, hash_verificacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_pedido, numero_factura, tipo_factura, subtotal, iva_monto, total, metodo_pago, hash_verificacion]
    );

    const [rows] = await pool.query("SELECT * FROM facturas WHERE id_factura = ?", [result.insertId]);
    return rows[0];
  },

  async obtenerPorPedido(id_pedido) {
    const [rows] = await pool.query("SELECT * FROM facturas WHERE id_pedido = ?", [id_pedido]);
    return rows[0];
  },
};

module.exports = FacturaModel;
