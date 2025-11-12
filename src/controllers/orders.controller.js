const OrdersService = require("../services/orders.service");
const { publishEvent } = require("../lib/publishEvent");

const OrdersController = {
  /**
   * Obtener todos los pedidos o solo los del cliente autenticado
   * - Cliente: solo sus pedidos
   * - Admin / Superadmin: todos los pedidos
   */
  async getOrders(req, res, next) {
    try {
      const { rol, id_usuario } = req.user;

      const data =
        rol === "cliente"
          ? await OrdersService.getUserOrders(id_usuario)
          : await OrdersService.getAllOrders();

      res.json({ ok: true, data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Obtener un pedido específico por ID
   * - El cliente solo puede acceder a sus propios pedidos.
   * - Los roles admin y superadmin pueden acceder a cualquier pedido.
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrdersService.getOrderById(id);

      // Verificar permisos
      if (
        req.user.rol === "cliente" &&
        order.pedido.id_usuario !== req.user.id_usuario
      ) {
        return res
          .status(403)
          .json({ ok: false, error: "No puedes acceder a este pedido." });
      }

      res.json({ ok: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  /**
   *  Crear un nuevo pedido (solo cliente autenticado)
   * - Obtiene el id_usuario desde el token JWT (no desde el body)
   * - Valida y envía los datos al servicio para insertar en la BD
   * - Registra automáticamente el estado inicial en historial_pedidos
   */
  async createOrder(req, res, next) {
    try {
      // ID del usuario autenticado (del JWT)
      const id_usuario = req.user.id_usuario;

      // Extraemos el resto del body validado por Joi
      const {
        subtotal,
        descuento_total,
        costo_envio,
        total,
        metodo_entrega,
        notas,
        detalles,
      } = req.body;

      // Llamada al servicio de creación del pedido
      const order = await OrdersService.createOrder({
        id_usuario,
        subtotal,
        descuento_total,
        costo_envio,
        total,
        metodo_entrega,
        notas,
        detalles,
      });

      publishEvent({ event: "OrderCreated", payload: order }).catch(() => {});

      res.status(201).json({
        ok: true,
        message: "Pedido creado exitosamente.",
        data: order,
      });
    } catch (err) {
      next(err);
    }
  },

  //Actualizar el estado de un pedido Solo admin o superadmin pueden cambiar el estado.
  //Registra automáticamente el cambio en historial_pedidos.
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { estado_nuevo, comentario } = req.body;

      const result = await OrdersService.updateOrderStatus(
        id,
        req.user.id_usuario, // usuario que ejecuta el cambio
        estado_nuevo,
        comentario
      );

      res.json({
        ok: true,
        message: "Estado del pedido actualizado correctamente.",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  //  Consultar historial de un pedido (cambios de estado)
  //  Admin y superadmin pueden ver cualquier historial.

  async getOrderHistory(req, res, next) {
    try {
      const { id } = req.params;
      const data = await OrdersService.getOrderHistory(id);
      res.json({ ok: true, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = OrdersController;
