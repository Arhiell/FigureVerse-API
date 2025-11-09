// MODELO DE PAGOS (consultas SQL directas)
const pool = require("../config/db");

/**
 * Operaciones sobre la tabla `pagos`.
 */
const PagoModel = {
  // Registrar un nuevo pago en la tabla
  /**
   * Inserta un pago pendiente asociado a un pedido.
   * @param {number} id_pedido
   * @param {string} metodo_pago
   * @param {number} monto
   * @param {string} id_transaccion
   * @param {object} rawData
   */
  crear: async (id_pedido, metodo_pago, monto, id_transaccion, rawData) => {
    const [result] = await pool.query(
      `INSERT INTO pagos (id_pedido, metodo_pago, estado_pago, id_transaccion, monto, raw_gateway_json)
       VALUES (?, ?, 'pendiente', ?, ?, ?)`,
      [id_pedido, metodo_pago, id_transaccion, monto, JSON.stringify(rawData)]
    );
    return result.insertId;
  },

  // Actualizar estado del pago según el webhook (por id_transaccion)
  /**
   * Actualiza el estado del pago por id_transaccion (webhook).
   * @param {string} id_transaccion
   * @param {string} nuevoEstado
   * @param {object} rawJson
   */
  actualizarEstado: async (id_transaccion, nuevoEstado, rawJson) => {
    await pool.query(
      `UPDATE pagos
       SET estado_pago = ?, fecha_pago = NOW(), raw_gateway_json = ?
       WHERE id_transaccion = ?`,
      [nuevoEstado, JSON.stringify(rawJson), id_transaccion]
    );
  },

  // Actualizar estado del pago por id_pedido (fallback usando external_reference)
  /**
   * Actualiza el estado del pago por id_pedido (fallback por external_reference).
   * @param {number} id_pedido
   * @param {string} nuevoEstado
   * @param {object} rawJson
   */
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
  /**
   * Obtiene un pago por su id_pago.
   * @param {number} id_pago
   * @returns {Promise<object|null>}
   */
  obtenerPorId: async (id_pago) => {
    const [rows] = await pool.query("SELECT * FROM pagos WHERE id_pago = ?", [id_pago]);
    return rows[0];
  },

  // Actualizar estado manualmente por id_pago
  /**
   * Actualiza el estado de un pago por id_pago.
   * @param {number} id_pago
   * @param {string} nuevoEstado
   * @param {object} rawJson
   */
  actualizarEstadoPorIdPago: async (id_pago, nuevoEstado, rawJson) => {
    await pool.query(
      `UPDATE pagos
       SET estado_pago = ?, fecha_pago = NOW(), raw_gateway_json = ?
       WHERE id_pago = ?`,
      [nuevoEstado, JSON.stringify(rawJson), id_pago]
    );
  },

  // Listar todos los pagos
  /**
   * Lista todos los pagos (ordenados descendente).
   * @returns {Promise<object[]>}
   */
  listar: async () => {
    const [rows] = await pool.query(
      "SELECT * FROM pagos ORDER BY id_pago DESC"
    );
    return rows;
  },

  // Listar pagos por estado (pendiente/aprobado/rechazado)
  /**
   * Lista los pagos filtrando por estado.
   * @param {('pendiente'|'aprobado'|'rechazado')} estado
   * @returns {Promise<object[]>}
   */
  listarPorEstado: async (estado) => {
    const [rows] = await pool.query(
      "SELECT * FROM pagos WHERE estado_pago = ? ORDER BY id_pago DESC",
      [estado]
    );
    return rows;
  },
};

module.exports = PagoModel;
