const pool = require("../config/db");
const {
  createProductoSchema,
  updateProductoSchema,
} = require("../middlewares/validators/validate_productos");

// CRUD de productos
// Crear producto
async function crearProducto(req, res, next) {
  try {
    const { error, value } = createProductoSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const sql = `
      INSERT INTO productos
        (nombre, descripcion, precio_base, stock, stock_minimo, iva_porcentaje,
         id_categoria, id_universo, id_fabricante, anio_lanzamiento, escala, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      value.nombre,
      value.descripcion,
      value.precio_base,
      value.stock,
      value.stock_minimo,
      value.iva_porcentaje,
      value.id_categoria,
      value.id_universo,
      value.id_fabricante,
      value.anio_lanzamiento,
      value.escala,
      value.estado,
    ];

    const [result] = await pool.execute(sql, params);
    res
      .status(201)
      .json({ message: "Producto creado", id_producto: result.insertId });
  } catch (err) {
    next(err);
  }
}

// Obtener todos los productos
async function listarProductos(req, res, next) {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, c.nombre_categoria, u.nombre AS universo, f.nombre AS fabricante
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN universos u ON p.id_universo = u.id_universo
      LEFT JOIN fabricantes f ON p.id_fabricante = f.id_fabricante
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Obtener producto por ID
async function obtenerProducto(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `
      SELECT p.*, c.nombre_categoria, u.nombre AS universo, f.nombre AS fabricante
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN universos u ON p.id_universo = u.id_universo
      LEFT JOIN fabricantes f ON p.id_fabricante = f.id_fabricante
      WHERE p.id_producto = ?
    `,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Actualizar producto
async function actualizarProducto(req, res, next) {
  try {
    const { id } = req.params;
    const { error, value } = updateProductoSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const campos = Object.keys(value);
    if (campos.length === 0)
      return res.status(400).json({ message: "Sin campos para actualizar" });

    const sets = campos.map((c) => `${c} = ?`).join(", ");
    const params = [...Object.values(value), id];

    const sql = `UPDATE productos SET ${sets}, updated_at = NOW() WHERE id_producto = ?`;
    const [result] = await pool.execute(sql, params);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Producto no encontrado" });
    res.json({ message: "Producto actualizado correctamente" });
  } catch (err) {
    next(err);
  }
}

// Eliminar producto (cambio de estado)
async function eliminarProducto(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      `UPDATE productos SET estado = 'inactivo' WHERE id_producto = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Producto no encontrado" });
    res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    next(err);
  }
}

// Funciones exportadas
module.exports = {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  eliminarProducto,
};
