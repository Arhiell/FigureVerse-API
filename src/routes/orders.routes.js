/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Gestión de pedidos, historial y estados
 */

/**
 * @swagger
 * /pedidos:
 *   get:
 *     summary: Obtener pedidos (del usuario o todos si es admin)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos obtenida correctamente.
 *       401:
 *         description: Token inválido o no autorizado.
 */

/**
 * @swagger
 * /pedidos/{id}:
 *   get:
 *     summary: Obtener un pedido específico
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del pedido
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido encontrado.
 *       404:
 *         description: Pedido no encontrado.
 */

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: Crear un nuevo pedido (cliente)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metodo_entrega:
 *                 type: string
 *                 enum: [retiro, envio_domicilio]
 *               notas:
 *                 type: string
 *               subtotal:
 *                 type: number
 *               descuento_total:
 *                 type: number
 *               costo_envio:
 *                 type: number
 *               total:
 *                 type: number
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_producto:
 *                       type: integer
 *                     id_variante:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *                     precio_unitario:
 *                       type: number
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente.
 *       400:
 *         description: Error de validación en los datos.
 */

/**
 * @swagger
 * /pedidos/{id}/estado:
 *   put:
 *     summary: Actualizar estado de un pedido (admin o superadmin)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del pedido a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado_nuevo:
 *                 type: string
 *                 enum: [pendiente, pagado, enviado, entregado, cancelado, reembolsado]
 *               comentario:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente.
 *       403:
 *         description: Acceso denegado.
 */

/**
 * @swagger
 * /pedidos/historial/{id}:
 *   get:
 *     summary: Consultar historial de un pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del pedido a consultar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historial obtenido correctamente.
 *       404:
 *         description: Pedido no encontrado.
 */

// RUTAS DEL MÓDULO DE PEDIDOS
const express = require("express");
const router = express.Router();
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");
const { celebrate, Segments } = require("celebrate");
const OrdersController = require("../controllers/orders.controller");
const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require("../middlewares/validators/orders.validator");

// Todas las rutas requieren autenticación JWT
router.use(authJwt);

// Crear nuevo pedido (solo cliente autenticado)
router.post(
  "/",
  checkRole("cliente"),
  celebrate({ [Segments.BODY]: createOrderSchema }),
  OrdersController.createOrder
);

// Obtener lista de pedidos
router.get("/", OrdersController.getOrders);

// Obtener un pedido específico
router.get("/:id", OrdersController.getOrderById);

// Actualizar estado de un pedido
router.put(
  "/:id/estado",
  checkRole("admin", "super_admin"),
  celebrate({ [Segments.BODY]: updateOrderStatusSchema }),
  OrdersController.updateOrderStatus
);

// Consultar historial (pendiente de implementar)
router.get(
  "/historial/:id",
  checkRole("cliente", "admin", "super_admin"),
  OrdersController.getOrderHistory
);

module.exports = router;
