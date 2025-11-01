const CarritoModel = require("../models/carrito.model");

const CarritoController = {
  // Obtener el carrito activo del usuario logueado
  async getCarrito(req, res, next) {
    try {
      const carrito = await CarritoModel.obtenerOCrearCarrito(req.user.id_usuario);
      const detalles = await CarritoModel.obtenerDetalles(carrito.id_carrito);
      res.json({ ok: true, carrito, detalles });
    } catch (err) {
      next(err);
    }
  },

  // Agregar producto al carrito
  async addItem(req, res, next) {
    try {
      const { id_producto, id_variante, cantidad, precio_unitario, iva_porcentaje } = req.body;
      const carrito = await CarritoModel.obtenerOCrearCarrito(req.user.id_usuario);

      const id_detalle = await CarritoModel.agregarItem({
        id_carrito: carrito.id_carrito,
        id_producto,
        id_variante,
        cantidad,
        precio_unitario,
        iva_porcentaje,
      });

      res.status(201).json({ ok: true, message: "Producto agregado", id_detalle });
    } catch (err) {
      next(err);
    }
  },

  // Eliminar producto
  async removeItem(req, res, next) {
    try {
      const carrito = await CarritoModel.obtenerOCrearCarrito(req.user.id_usuario);
      await CarritoModel.eliminarItem(req.params.id_detalle, carrito.id_carrito);
      res.json({ ok: true, message: "Producto eliminado" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = CarritoController;
