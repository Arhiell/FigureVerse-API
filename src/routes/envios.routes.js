/**
 * @swagger
 * tags:
 *   name: Envíos
 *   description: Gestión de envíos vinculados a pedidos y pagos
 */

/**
 * @swagger
 * /envios:
 *   post:
 *     summary: Crear un nuevo envío (solo sistema o admin, al confirmar pago)
 *     tags: [Envíos]
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
 *               destinatario:
 *                 type: string
 *               direccion_envio:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               provincia:
 *                 type: string
 *               pais:
 *                 type: string
 *               codigo_postal:
 *                 type: string
 *               empresa_envio:
 *                 type: string
 *               numero_seguimiento:
 *                 type: string
 *               estado_envio:
 *                 type: string
 *                 enum: [preparando, en_camino, entregado, devuelto]
 *     responses:
 *       201:
 *         description: Envío creado exitosamente.
 *       400:
 *         description: Error de validación o negocio.
 */

/**
 * @swagger
 * /envios:
 *   get:
 *     summary: Listar envíos (admin/super) o ver los propios (cliente)
 *     tags: [Envíos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de envíos obtenida.
 *       401:
 *         description: No autorizado.
 */

/**
 * @swagger
 * /envios/{id}:
 *   get:
 *     summary: Obtener un envío por ID
 *     tags: [Envíos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del envío
 *     responses:
 *       200:
 *         description: Envío encontrado.
 *       404:
 *         description: Envío no encontrado.
 */

/**
 * @swagger
 * /envios/{id}:
 *   put:
 *     summary: Actualizar datos o estado del envío (solo admin/super)
 *     tags: [Envíos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del envío
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destinatario: { type: string }
 *               direccion_envio: { type: string }
 *               ciudad: { type: string }
 *               provincia: { type: string }
 *               pais: { type: string }
 *               codigo_postal: { type: string }
 *               empresa_envio: { type: string }
 *               numero_seguimiento: { type: string }
 *               estado_envio:
 *                 type: string
 *                 enum: [preparando, en_camino, entregado, devuelto]
 *               fecha_envio: { type: string, format: date-time }
 *               fecha_entrega: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Envío actualizado.
 *       403:
 *         description: Acceso denegado.
 */

//RUTAS DEL MÓDULO DE ENVÍOS
const express = require("express");
const router = express.Router();
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");
const { celebrate, Segments } = require("celebrate");
const EnviosController = require("../controllers/envios.controller");
const {
  createEnvioSchema,
  updateEnvioSchema,
} = require("../middlewares/validators/envios.validator");

// Protección por JWT para todas las rutas de envíos
router.use(authJwt);

// Crear un nuevo envío (admin/sistema al confirmar pago)
// Si eventualmente generás un "sistema" interno, podés añadir un role "system".
router.post(
  "/",
  checkRole("admin", "super_admin"), // permite admin/super; el hook del sistema puede usar token de servicio
  celebrate({ [Segments.BODY]: createEnvioSchema }),
  EnviosController.crearEnvio
);

// Listar envíos
// - cliente: ve solo los suyos (filtrado en servicio)
// - admin/super: ve todos
router.get("/", EnviosController.listarEnvios);

// Obtener un envío por ID (cliente puede ver el suyo)
router.get("/:id", EnviosController.obtenerEnvio);

// Actualizar un envío (solo admin/super)
router.put(
  "/:id",
  checkRole("admin", "super_admin"),
  celebrate({ [Segments.BODY]: updateEnvioSchema }),
  EnviosController.actualizarEnvio
);

module.exports = router;
