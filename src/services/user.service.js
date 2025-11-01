
 // Servicio de usuarios

const pool = require("../config/db");

const UserService = {
  /** Actualiza el estado de un usuario
   * @param {number} id_usuario
   * @param {string} estado - 'activo' | 'inhabilitado'
   */
  async updateStatus(id_usuario, estado) {
    const conn = await pool.getConnection();
    try {
      await conn.query("UPDATE usuarios SET estado = ? WHERE id_usuario = ?", [estado, id_usuario]);
      return true;
    } finally {
      conn.release();
    }
  },

  /**
   * Obtiene un usuario por id
   */
  async getById(id_usuario) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query("SELECT * FROM usuarios WHERE id_usuario = ?", [id_usuario]);
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }
};

module.exports = UserService;