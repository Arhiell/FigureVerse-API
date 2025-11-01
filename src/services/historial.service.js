// SERVICIO DE HISTORIAL DE PEDIDOS
const pool = require("../config/db");

const HistorialService = {
  // Registrar un cambio de estado en la tabla historial_pedidos
  registrarCambio: async (
    id_pedido,
    estado_anterior,
    estado_nuevo,
    id_usuario,
    comentario
  ) => {
    await pool.query(
      "INSERT INTO historial_pedidos (id_pedido, estado_anterior, estado_nuevo, id_usuario, comentario) VALUES (?, ?, ?, ?, ?)",
      [id_pedido, estado_anterior, estado_nuevo, id_usuario, comentario]
    );
  },

  // Obtener el historial completo de un pedido
  obtenerPorPedido: async (id_pedido) => {
    const [rows] = await pool.query(
      `SELECT h.*, u.nombre_usuario 
       FROM historial_pedidos h 
       LEFT JOIN usuarios u ON u.id_usuario = h.id_usuario
       WHERE h.id_pedido = ? ORDER BY h.fecha_cambio DESC`,
      [id_pedido]
    );
    return rows;
  },
};

module.exports = HistorialService;
