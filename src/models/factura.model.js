const pool = require("../config/db");
const crypto = require("crypto");

/**
 * Operaciones sobre la tabla `facturas`.
 */
const FacturaModel = {
  /**
   * Crea una factura para un pedido.
   * @param {{id_pedido:number, tipo_factura?:('A'|'B'|'C'), subtotal:number, iva_monto:number, total:number, metodo_pago:string}} payload
   * @returns {Promise<object>} La factura creada.
   */
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

  /**
   * Obtiene una factura por su ID.
   * @param {number} id_factura
   * @returns {Promise<object|null>}
   */
  async obtenerPorId(id_factura) {
    const [rows] = await pool.query("SELECT * FROM facturas WHERE id_factura = ?", [id_factura]);
    return rows[0];
  },

  /**
   * Obtiene la factura asociada a un pedido.
   * @param {number} id_pedido
   * @returns {Promise<object|null>}
   */
  async obtenerPorPedido(id_pedido) {
    const [rows] = await pool.query("SELECT * FROM facturas WHERE id_pedido = ?", [id_pedido]);
    return rows[0];
  },
};

module.exports = FacturaModel;
