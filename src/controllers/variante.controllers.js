const pool = require('../db');
const { varianteSchema } = require('../validations/variante.validate');

// Crear variante
exports.crearVariante = async (req, res, next) => {
  try {
    const { error, value } = varianteSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Verificar que el producto exista
    const [producto] = await pool.query('SELECT id_producto FROM productos WHERE id_producto = ?', [value.id_producto]);
    if (!producto.length) return res.status(404).json({ message: 'Producto no encontrado' });

    const [result] = await pool.query('INSERT INTO variantes_producto SET ?', [value]);
    res.status(201).json({ message: 'Variante creada', id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// Listar todas las variantes o filtrar por producto
exports.listarVariantes = async (req, res, next) => {
  try {
    const { id_producto } = req.query;
    const query = id_producto
      ? 'SELECT * FROM variantes_producto WHERE id_producto = ?'
      : 'SELECT * FROM variantes_producto';
    const [rows] = await pool.query(query, id_producto ? [id_producto] : []);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Obtener una por ID
exports.obtenerVariante = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM variantes_producto WHERE id_variante = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Variante no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// Actualizar
exports.actualizarVariante = async (req, res, next) => {
  try {
    const { error, value } = varianteSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const [result] = await pool.query('UPDATE variantes_producto SET ? WHERE id_variante = ?', [value, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Variante no encontrada' });
    res.json({ message: 'Variante actualizada' });
  } catch (err) {
    next(err);
  }
};

// Eliminar
exports.eliminarVariante = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM variantes_producto WHERE id_variante = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Variante no encontrada' });
    res.json({ message: 'Variante eliminada' });
  } catch (err) {
    next(err);
  }
};
