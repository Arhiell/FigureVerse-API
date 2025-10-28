const pool = require('../db');
const { createProductoSchema, updateProductoSchema } = require('../validations/validate_productos');

// CRUD de productos
// Crear un nuevo producto
crearUniverso = async (req, res, next) => {
  try {
    const { error, value } = universoSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const [result] = await pool.query('INSERT INTO universos SET ?', [value]);
    res.status(201).json({ message: 'Universo creado', id: result.insertId });
  } catch (err) {
    next(err);
  }
};
// Listar todos los universos
listarUniversos = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM universos');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
// Obtener un universo por ID
obtenerUniverso = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM universos WHERE id_universo = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Universo no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
// Actualizar un universo existente
actualizarUniverso = async (req, res, next) => {
  try {
    const { error, value } = universoSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const [result] = await pool.query('UPDATE universos SET ? WHERE id_universo = ?', [value, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Universo no encontrado' });
    res.json({ message: 'Universo actualizado' });
  } catch (err) {
    next(err);
  }
};
// Eliminar un universo
eliminarUniverso = async (req, res, next) => {
  try {
    const [result] = await pool.query('UPDATE FROM universos WHERE id_universo = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Universo no encontrado' });
    res.json({ message: 'Universo eliminado' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearUniverso,
  listarUniversos,
  obtenerUniverso,
  actualizarUniverso,
  eliminarUniverso
};
