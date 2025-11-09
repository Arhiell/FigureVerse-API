/**
 * @swagger
 * tags:
 *   name: Pagos
 *   description: Integración con Mercado Pago (creación, consulta, webhook)
 */

/**
 * @swagger
 * /pagos:
 *   post:
 *     summary: Iniciar un nuevo pago
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_pedido:
 *                 type: integer
 *               monto:
 *                 type: number
 *     responses:
 *       201:
 *         description: Preferencia de pago creada.
 */

/**
 * @swagger
 * /pagos/callback:
 *   post:
 *     summary: Webhook de Mercado Pago
 *     tags: [Pagos]
 *     description: Recibe notificaciones automáticas y actualiza el estado del pago.
 *     security: []
 *     responses:
 *       200:
 *         description: Webhook procesado correctamente.
 */

/**
 * @swagger
 * /pagos/{id}:
 *   get:
 *     summary: Consultar estado de un pago
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estado del pago obtenido correctamente.
 *       404:
 *         description: Pago no encontrado.
 */

const express = require("express");
const router = express.Router();
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");
const PagosController = require("../controllers/pagos.controller");

/**
 * Webhook de Mercado Pago (sin autenticación)
 * Nota: Este endpoint no requiere JWT y es consumido por Mercado Pago.
 */
router.post(
  "/callback",
  express.raw({ type: "*/*" }),
  PagosController.recibirWebhook
);

// Protege el resto de rutas de pagos con JWT
router.use(authJwt);

/**
 * Iniciar un nuevo pago
 */
router.post("/", PagosController.createPayment);

/**
 * Listar todos los pagos (admin/super_admin)
 */
router.get(
  "/",
  checkRole("admin", "super_admin"),
  PagosController.listarPagos
);

/**
 * @swagger
 * /pagos:
 *   get:
 *     summary: Lista todos los pagos registrados.
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de pagos.
 */

/**
 * Listar pagos pendientes (admin/super_admin)
 */
router.get(
  "/pendientes",
  checkRole("admin", "super_admin"),
  PagosController.listarPendientes
);

/**
 * @swagger
 * /pagos/pendientes:
 *   get:
 *     summary: Lista pagos con estado pendiente.
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de pagos pendientes.
 */

/**
 * Consultar estado de un pago
 */
router.get(
  "/:id",
  checkRole("cliente", "admin", "super_admin"),
  PagosController.obtenerPago
);

/**
 * Listar todos los pagos (admin/super_admin)
 */
router.get(
  "/",
  checkRole("admin", "super_admin"),
  PagosController.listarPagos
);

/**
 * Listar pagos pendientes (admin/super_admin)
 */
router.get(
  "/pendientes",
  checkRole("admin", "super_admin"),
  PagosController.listarPendientes
);

/**
 * @swagger
 * /pagos/{id}/estado:
 *   put:
 *     summary: Actualizar estado del pago manualmente (admin/super_admin)
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, aprobado, rechazado]
 *               motivo:
 *                 type: string
 *                 example: "Aprobado manualmente por verificación contable"
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente.
 *       400:
 *         description: Estado inválido.
 *       404:
 *         description: Pago no encontrado.
 */

// Actualizar estado del pago manualmente
router.put(
  "/:id/estado",
  checkRole("admin", "super_admin"),
  PagosController.actualizarEstadoManual
);

// Alias PATCH para actualizar estado del pago
router.patch(
  "/:id/estado",
  checkRole("admin", "super_admin"),
  PagosController.actualizarEstadoManual
);

/**
 * @swagger
 * /pagos/{id}/estado:
 *   patch:
 *     summary: Actualiza manualmente el estado del pago (alias de PUT).
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, aprobado, rechazado]
 *               motivo:
 *                 type: string
 *                 example: "Aprobado manualmente por verificación contable"
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente.
 *       400:
 *         description: Estado inválido.
 *       404:
 *         description: Pago no encontrado.
 */

module.exports = router;
