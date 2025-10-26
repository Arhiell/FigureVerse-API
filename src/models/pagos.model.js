// MODELO DE PAGOS (consultas SQL directas)
const pool = require("../config/db");

const PagoModel = {
  // Registrar un nuevo pago en la tabla
  crear: async (id_pedido, metodo_pago, monto, id_transaccion, rawData) => {
    const [result] = await pool.query(
      `INSERT INTO pagos (id_pedido, metodo_pago, estado_pago, id_transaccion, monto, raw_gateway_json)
       VALUES (?, ?, 'pendiente', ?, ?, ?)`,
      [id_pedido, metodo_pago, id_transaccion, monto, JSON.stringify(rawData)]
    );
    return result.insertId;
  },

  // Actualizar estado del pago según el webhook (por id_transaccion)
  actualizarEstado: async (id_transaccion, nuevoEstado, rawJson) => {
    await pool.query(
      `UPDATE pagos
       SET estado_pago = ?, fecha_pago = NOW(), raw_gateway_json = ?
       WHERE id_transaccion = ?`,
      [nuevoEstado, JSON.stringify(rawJson), id_transaccion]
    );
  },

  // Actualizar estado del pago por id_pedido (fallback usando external_reference)
  actualizarEstadoPorPedido: async (id_pedido, nuevoEstado, rawJson) => {
    await pool.query(
      `UPDATE pagos
       SET estado_pago = ?, fecha_pago = NOW(), raw_gateway_json = ?
       WHERE id_pedido = ?
       ORDER BY id_pago DESC
       LIMIT 1`,
      [nuevoEstado, JSON.stringify(rawJson), id_pedido]
    );
  },

  // Consultar estado del pago por ID
  obtenerPorId: async (id_pago) => {
    const [rows] = await pool.query("SELECT * FROM pagos WHERE id_pago = ?", [id_pago]);
    return rows[0];
  },
};

module.exports = PagoModel;
