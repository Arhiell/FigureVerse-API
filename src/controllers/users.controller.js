const db = require("../config/db");

// Obtiene los datos básicos de un usuario por ID
exports.getUserById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT id_usuario, nombre_usuario, email, rol, estado
       FROM usuarios WHERE id_usuario = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Usuario no encontrado" });
    }

    res.status(200).json({ ok: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};
