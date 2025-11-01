const pool = require("../config/db");

const CarritoModel = {
  // Obtener el carrito activo del usuario (o crear uno nuevo si no existe)
  async obtenerOCrearCarrito(id_usuario) {
    const [rows] = await pool.query(
      "SELECT * FROM carrito WHERE id_usuario = ? AND estado = 'activo' LIMIT 1",
      [id_usuario]
    );

    if (rows.length > 0) return rows[0];

    const [result] = await pool.query(
      "INSERT INTO carrito (id_usuario) VALUES (?)",
      [id_usuario]
    );

    const [nuevo] = await pool.query("SELECT * FROM carrito WHERE id_carrito = ?", [result.insertId]);
    return nuevo[0];
  },

  // Agregar o actualizar producto en el carrito
  async agregarItem({ id_carrito, id_producto, id_variante, cantidad, precio_unitario, iva_porcentaje }) {
    const [rows] = await pool.query(
      "SELECT * FROM carrito_detalle WHERE id_carrito = ? AND id_producto = ? AND (id_variante <=> ?)",
      [id_carrito, id_producto, id_variante]
    );

    if (rows.length > 0) {
      // Ya existe → actualizar cantidad
      await pool.query(
        "UPDATE carrito_detalle SET cantidad = cantidad + ?, updated_at = NOW() WHERE id_detalle = ?",
        [cantidad, rows[0].id_detalle]
      );
      return rows[0].id_detalle;
    }

    // Nuevo producto
    const iva_monto = ((precio_unitario * cantidad) * iva_porcentaje) / 100;
    const [result] = await pool.query(
      `INSERT INTO carrito_detalle 
        (id_carrito, id_producto, id_variante, cantidad, precio_unitario, iva_porcentaje, iva_monto)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_carrito, id_producto, id_variante, cantidad, precio_unitario, iva_porcentaje, iva_monto]
    );

    return result.insertId;
  },

  // Obtener detalles del carrito
  async obtenerDetalles(id_carrito) {
    const [rows] = await pool.query(
      `SELECT cd.*, p.nombre, p.descripcion, vp.atributo, vp.valor
       FROM carrito_detalle cd
       JOIN productos p ON p.id_producto = cd.id_producto
       LEFT JOIN variantes_producto vp ON vp.id_variante = cd.id_variante
       WHERE cd.id_carrito = ?`,
      [id_carrito]
    );
    return rows;
  },

  // Eliminar producto del carrito
  async eliminarItem(id_detalle, id_carrito) {
    await pool.query("DELETE FROM carrito_detalle WHERE id_detalle = ? AND id_carrito = ?", [id_detalle, id_carrito]);
  },

  // Vaciar carrito (tras compra)
  async vaciarCarrito(id_carrito) {
    await pool.query("DELETE FROM carrito_detalle WHERE id_carrito = ?", [id_carrito]);
    await pool.query("UPDATE carrito SET estado = 'comprado', updated_at = NOW() WHERE id_carrito = ?", [id_carrito]);
  },
};

module.exports = CarritoModel;
