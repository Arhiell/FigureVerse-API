const pool = require("../config/db");

const ClientService = {
  async getByUserId(id_usuario) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        "SELECT * FROM clientes WHERE id_usuario = ?",
        [id_usuario]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  },

  async upsertByUserId(id_usuario, data) {
    // Actualiza solo las columnas enviadas. Si el perfil no existe, exige mínimos.
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Consultar si existe perfil de cliente
      const [rows] = await conn.query(
        "SELECT id_cliente FROM clientes WHERE id_usuario = ?",
        [id_usuario]
      );

      // Mapeo de campos permitidos
      const allowed = [
        "nombre",
        "apellido",
        "dni",
        "telefono",
        "direccion",
        "numero",
        "piso",
        "departamento",
        "referencia",
        "provincia",
        "pais",
        "ciudad",
        "codigo_postal",
        "fecha_nacimiento",
        "preferencias",
      ];

      // Construir objeto sólo con claves presentes en data (no undefined)
      const updates = {};
      for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined) {
          updates[key] = data[key];
        }
      }

      if (rows.length === 0) {
        // Perfil no existe: validar campos mínimos requeridos por la tabla
        const required = [
          "nombre",
          "apellido",
          "dni",
          "direccion",
          "ciudad",
          "provincia",
          "codigo_postal",
        ];
        const missing = required.filter((k) => updates[k] == null || updates[k] === "");
        if (missing.length > 0) {
          const err = new Error(
            `Perfil no existe. Faltan campos requeridos: ${missing.join(", ")}`
          );
          err.code = "MISSING_REQUIRED";
          err.missing = missing;
          throw err;
        }

        // Valor por defecto de país si no se envía y la DB lo requiere
        if (!updates.pais) updates.pais = "Argentina"; // Ajustar según política

        // Construir INSERT dinámico con sólo las columnas presentes
        const cols = ["id_usuario", ...Object.keys(updates)];
        const placeholders = cols.map(() => "?").join(", ");
        const values = [id_usuario, ...cols.slice(1).map((c) => updates[c])];
        const sql = `INSERT INTO clientes (${cols.join(", ")}) VALUES (${placeholders})`;
        await conn.query(sql, values);
      } else {
        // Perfil existe: actualización parcial de sólo columnas enviadas
        const keys = Object.keys(updates);
        if (keys.length === 0) {
          // Nada que actualizar; devolver el perfil actual
          const [current] = await conn.query(
            "SELECT * FROM clientes WHERE id_usuario = ?",
            [id_usuario]
          );
          await conn.commit();
          return current[0] || null;
        }
        const setClause = keys.map((k) => `${k} = ?`).join(", ");
        const values = keys.map((k) => updates[k]);
        const sql = `UPDATE clientes SET ${setClause} WHERE id_usuario = ?`;
        await conn.query(sql, [...values, id_usuario]);
      }

      await conn.commit();

      // Devolver perfil actualizado
      const [resultRows] = await conn.query(
        "SELECT * FROM clientes WHERE id_usuario = ?",
        [id_usuario]
      );
      return resultRows[0] || null;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = ClientService;