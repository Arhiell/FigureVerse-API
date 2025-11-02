const pool = require("../config/db");
const { imagenSchema } = require("../middlewares/validators/validate_imagen");

// Crear imagen
exports.crearImagen = async (req, res, next) => {
  try {
    const { error, value } = imagenSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // Verificar que el producto exista
    const [producto] = await pool.query(
      "SELECT id_producto FROM productos WHERE id_producto = ?",
      [value.id_producto]
    );
    if (!producto.length)
      return res.status(404).json({ message: "Producto no encontrado" });

    // Si se pasa una variante, verificarla
    if (value.id_variante) {
      const [variante] = await pool.query(
        "SELECT id_variante FROM variantes_producto WHERE id_variante = ?",
        [value.id_variante]
      );
      if (!variante.length)
        return res.status(404).json({ message: "Variante no encontrada" });
    }

    const [result] = await pool.query("INSERT INTO imagenes_productos SET ?", [
      value,
    ]);
    res.status(201).json({ message: "Imagen creada", id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// Listar imágenes (por producto o todas)
exports.listarImagenes = async (req, res, next) => {
  try {
    const { id_producto } = req.query;
    const query = id_producto
      ? "SELECT * FROM imagenes_productos WHERE id_producto = ? ORDER BY posicion ASC"
      : "SELECT * FROM imagenes_productos ORDER BY id_producto, posicion ASC";
    const [rows] = await pool.query(query, id_producto ? [id_producto] : []);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Obtener imagen por ID
exports.obtenerImagen = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM imagenes_productos WHERE id_imagen = ?",
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Imagen no encontrada" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// Actualizar imagen
exports.actualizarImagen = async (req, res, next) => {
  try {
    const { error, value } = imagenSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const [result] = await pool.query(
      "UPDATE imagenes_productos SET ? WHERE id_imagen = ?",
      [value, req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Imagen no encontrada" });
    res.json({ message: "Imagen actualizada" });
  } catch (err) {
    next(err);
  }
};

// Eliminar imagen
exports.eliminarImagen = async (req, res, next) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM imagenes_productos WHERE id_imagen = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Imagen no encontrada" });
    res.json({ message: "Imagen eliminada" });
  } catch (err) {
    next(err);
  }
};
