const pool = require("../config/db");
const { publishEvent } = require("../lib/publishEvent");
const { EventDispatcher } = require("../lib/eventDispatcher");
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

    // Validación de claves foráneas para evitar errores 500 por constraints
    const fkErrors = [];
    try {
      const [fabRows] = await pool.execute(
        "SELECT id_fabricante FROM fabricantes WHERE id_fabricante = ?",
        [value.id_fabricante]
      );
      if (!fabRows || fabRows.length === 0) fkErrors.push("id_fabricante inexistente");

      const [catRows] = await pool.execute(
        "SELECT id_categoria FROM categorias WHERE id_categoria = ?",
        [value.id_categoria]
      );
      if (!catRows || catRows.length === 0) fkErrors.push("id_categoria inexistente");

      const [uniRows] = await pool.execute(
        "SELECT id_universo FROM universos WHERE id_universo = ?",
        [value.id_universo]
      );
      if (!uniRows || uniRows.length === 0) fkErrors.push("id_universo inexistente");
    } catch (fkCheckErr) {
      return res.status(500).json({ message: "Error validando claves foráneas", detalle: fkCheckErr.message });
    }
    if (fkErrors.length) {
      return res.status(400).json({ message: "Claves foráneas inválidas", detalles: fkErrors });
    }

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

    const nuevoProducto = {
      id_producto: result.insertId,
      nombre: value.nombre,
      descripcion: value.descripcion,
      precio_base: value.precio_base,
      stock: value.stock,
      stock_minimo: value.stock_minimo,
      iva_porcentaje: value.iva_porcentaje,
      id_categoria: value.id_categoria,
      id_universo: value.id_universo,
      id_fabricante: value.id_fabricante,
      anio_lanzamiento: value.anio_lanzamiento,
      escala: value.escala,
      estado: value.estado,
    };

    try {
      await publishEvent({ event: "ProductCreated", payload: nuevoProducto });
    } catch (_) {}

    res.status(201).json({ message: "Producto creado", id_producto: result.insertId });
  } catch (err) {
    // Publicar evento de fallo de creación (no bloquear la respuesta)
    try {
      await publishEvent({
        event: "ProductCreateFailed",
        payload: {
          reason: err.code || err.message,
          details: {
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState,
          },
        },
        version: "v1",
        origin: "node-core",
      });
    } catch (_) {}
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

    // Validar FKs si se están cambiando
    const fkErrors = [];
    try {
      if (value.id_fabricante !== undefined) {
        const [fabRows] = await pool.execute(
          "SELECT id_fabricante FROM fabricantes WHERE id_fabricante = ?",
          [value.id_fabricante]
        );
        if (!fabRows || fabRows.length === 0) fkErrors.push("id_fabricante inexistente");
      }

      if (value.id_categoria !== undefined) {
        const [catRows] = await pool.execute(
          "SELECT id_categoria FROM categorias WHERE id_categoria = ?",
          [value.id_categoria]
        );
        if (!catRows || catRows.length === 0) fkErrors.push("id_categoria inexistente");
      }

      if (value.id_universo !== undefined) {
        const [uniRows] = await pool.execute(
          "SELECT id_universo FROM universos WHERE id_universo = ?",
          [value.id_universo]
        );
        if (!uniRows || uniRows.length === 0) fkErrors.push("id_universo inexistente");
      }
    } catch (fkCheckErr) {
      return res.status(500).json({ message: "Error validando claves foráneas", detalle: fkCheckErr.message });
    }
    if (fkErrors.length) {
      return res.status(400).json({ message: "Claves foráneas inválidas", detalles: fkErrors });
    }

    const sets = campos.map((c) => `${c} = ?`).join(", ");
    const params = [...Object.values(value), id];

    const sql = `UPDATE productos SET ${sets}, updated_at = NOW() WHERE id_producto = ?`;
    const [result] = await pool.execute(sql, params);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Producto no encontrado" });
    const productoActualizado = {
      id_producto: Number(id),
      campos_modificados: campos,
      datos_nuevos: value,
      updated_at: new Date().toISOString(),
    };

    try {
      await publishEvent({ event: "ProductUpdated", payload: productoActualizado });
    } catch (_) {}

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

    // Eliminar variantes asociadas al producto
    await pool.execute(
      `DELETE FROM variantes_producto WHERE id_producto = ?`,
      [id]
    );

    // Eliminar imágenes asociadas al producto
    await pool.execute(
      `DELETE FROM imagenes_productos WHERE id_producto = ?`,
      [id]
    );

    // Emitir evento de eliminación (soft delete) al marcar como inactivo
    try {
      await EventDispatcher.productDeleted({
        id_producto: Number(id),
        estado: "inactivo",
        deleted_at: new Date().toISOString(),
      });
    } catch (_) {}
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
