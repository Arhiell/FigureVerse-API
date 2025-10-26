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

// Protege todas las rutas con JWT
router.use(authJwt);

/**
 * Iniciar un nuevo pago
 */
router.post("/", PagosController.createPayment);

/**
 * Webhook de Mercado Pago (sin autenticación)
 */
router.post(
  "/callback",
  express.raw({ type: "*/*" }),
  PagosController.recibirWebhook
);

/**
 * Consultar estado de un pago
 */
router.get(
  "/:id",
  checkRole("cliente", "admin", "super_admin"),
  PagosController.obtenerPago
);

module.exports = router;
