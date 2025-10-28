const pool = require('../db');

// CRUD de categorías
// Crear categoría
// Listar todas las categorías
async function listarCategorias(req, res, next) {
  try {
    const [rows] = await db.query('SELECT * FROM categorias');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Obtener categoría por ID
async function obtenerCategoria(req, res, next) {
  try {
    const [rows] = await db.query('SELECT * FROM categorias WHERE id_categoria = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Crear nueva categoría
async function crearCategoria(req, res, next) {
  try {
    const { error, value } = categoriaSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const [result] = await db.query('INSERT INTO categorias SET ?', [value]);
    res.status(201).json({ message: 'Categoría creada', id: result.insertId });
  } catch (err) {
    next(err);
  }
}

// Actualizar categoría
async function actualizarCategoria(req, res, next) {
  try {
    const { error, value } = categoriaSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    await db.query('UPDATE categorias SET ? WHERE id_categoria = ?', [value, req.params.id]);
    res.json({ message: 'Categoría actualizada' });
  } catch (err) {
    next(err);
  }
}

// Eliminar categoría
async function eliminarCategoria(req, res, next) {
  try {
    await db.query('UPDATE categorias SET estado = "inactivo" WHERE id_categoria = ?', [req.params.id]);
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
};