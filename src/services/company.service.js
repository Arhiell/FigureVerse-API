const pool = require("../config/db");

// Servicio para gestionar la configuración de la empresa (una sola fila)
// Permite obtener y actualizar datos como nombre, email remitente, teléfonos y redes.

const CompanyService = {
  async getSettings() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query("SELECT * FROM company_settings LIMIT 1");
      return rows[0] || null;
    } finally {
      conn.release();
    }
  },

  async upsertSettings(data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query("SELECT id FROM company_settings LIMIT 1");
      const allowed = [
        "from_name",
        "from_email",
        "telefono",
        "direccion",
        "numero",
        "piso",
        "departamento",
        "ciudad",
        "provincia",
        "pais",
        "codigo_postal",
        "sitio_web",
        "instagram",
        "facebook",
        "twitter",
        "tiktok",
        "youtube",
        "logo_url",
      ];

      const updates = {};
      for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined) {
          updates[key] = data[key];
        }
      }

      if (rows.length === 0) {
        // Insert inicial solamente con las columnas enviadas
        const cols = Object.keys(updates);
        if (cols.length === 0) {
          // Crear una fila vacía con defaults
          await conn.query("INSERT INTO company_settings (from_name) VALUES (?)", ["FigureVerse"]);
        } else {
          const placeholders = cols.map(() => "?").join(", ");
          const values = cols.map((c) => updates[c]);
          const sql = `INSERT INTO company_settings (${cols.join(", ")}) VALUES (${placeholders})`;
          await conn.query(sql, values);
        }
      } else {
        // Update parcial de solo las columnas enviadas
        const keys = Object.keys(updates);
        if (keys.length > 0) {
          const setClause = keys.map((k) => `${k} = ?`).join(", ");
          const values = keys.map((k) => updates[k]);
          const sql = `UPDATE company_settings SET ${setClause} WHERE id = ?`;
          await conn.query(sql, [...values, rows[0].id]);
        }
      }

      await conn.commit();

      const [result] = await conn.query("SELECT * FROM company_settings LIMIT 1");
      return result[0] || null;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = CompanyService;