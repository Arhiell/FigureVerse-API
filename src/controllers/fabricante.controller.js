const db = require("../config/db");
const {
  fabricanteSchema,
} = require("../middlewares/validators/validate_facricante");
// CRUD de fabricantes
// Listar todos los fabricantes
async function listarFabricantes(req, res, next) {
  try {
    const [rows] = await db.query("SELECT * FROM fabricantes");
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Obtener un fabricante por ID
async function obtenerFabricante(req, res, next) {
  try {
    const [rows] = await db.query(
      "SELECT * FROM fabricantes WHERE id_fabricante = ?",
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Fabricante no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Crear un nuevo fabricante
async function crearFabricante(req, res, next) {
  try {
    const { error, value } = fabricanteSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const [result] = await db.query("INSERT INTO fabricantes SET ?", [value]);
    res.status(201).json({ message: "Fabricante creado", id: result.insertId });
  } catch (err) {
    next(err);
  }
}

// Actualizar un fabricante existente
async function actualizarFabricante(req, res, next) {
  try {
    const { error, value } = fabricanteSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    await db.query("UPDATE fabricantes SET ? WHERE id_fabricante = ?", [
      value,
      req.params.id,
    ]);
    res.json({ message: "Fabricante actualizado" });
  } catch (err) {
    next(err);
  }
}

// Eliminar un fabricante
async function eliminarFabricante(req, res, next) {
  try {
    await db.query(
      'UPDATE fabricantes SET estado = "eliminado" WHERE id_fabricante = ?',
      [req.params.id]
    );
    res.json({ message: "Fabricante eliminado" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarFabricantes,
  obtenerFabricante,
  crearFabricante,
  actualizarFabricante,
  eliminarFabricante,
};
