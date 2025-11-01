const express = require("express");
const router = express.Router();
const DescuentosController = require("../controllers/descuentos.controller");
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roles.middleware");

// Middleware global de autenticación
router.use(authJwt);

/**
 * @swagger
 * tags:
 *   name: Descuentos
 *   description: Gestión de descuentos, promociones y aplicación a pedidos
 */

/**
 * @swagger
 * /descuentos:
 *   post:
 *     summary: Crear un nuevo descuento (solo admin o superadmin)
 *     tags: [Descuentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - tipo
 *               - valor
 *               - fecha_inicio
 *               - fecha_fin
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: VERANO2025
 *               descripcion:
 *                 type: string
 *                 example: Promoción de verano 2025
 *               tipo:
 *                 type: string
 *                 enum: [porcentaje, monto, envio_gratis]
 *               valor:
 *                 type: number
 *                 example: 15
 *               fecha_inicio:
 *                 type: string
 *                 format: date-time
 *               fecha_fin:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Descuento creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post("/", checkRole("admin", "super_admin"), DescuentosController.crear);

/**
 * @swagger
 * /descuentos:
 *   get:
 *     summary: Listar todos los descuentos disponibles
 *     tags: [Descuentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de descuentos obtenida correctamente
 */
router.get("/", DescuentosController.listar);

/**
 * @swagger
 * /descuentos/{codigo}:
 *   get:
 *     summary: Obtener un descuento por su código
 *     tags: [Descuentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código del descuento
 *     responses:
 *       200:
 *         description: Descuento encontrado
 *       404:
 *         description: Descuento no encontrado
 */
router.get("/:codigo", DescuentosController.obtenerPorCodigo);

/**
 * @swagger
 * /descuentos/{id}:
 *   put:
 *     summary: Actualizar un descuento existente
 *     tags: [Descuentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del descuento
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               valor:
 *                 type: number
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo]
 *     responses:
 *       200:
 *         description: Descuento actualizado correctamente
 *       404:
 *         description: Descuento no encontrado
 */
router.put(
  "/:id",
  checkRole("admin", "super_admin"),
  DescuentosController.actualizar
);

/**
 * @swagger
 * /descuentos/{id}:
 *   delete:
 *     summary: Desactivar un descuento existente
 *     tags: [Descuentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del descuento
 *     responses:
 *       200:
 *         description: Descuento desactivado correctamente
 */
router.delete(
  "/:id",
  checkRole("admin", "super_admin"),
  DescuentosController.eliminar
);

/**
 * @swagger
 * /pedidos/{id}/descuento:
 *   post:
 *     summary: Aplicar un descuento a un pedido (solo cliente)
 *     tags: [Descuentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: VERANO2025
 *     responses:
 *       200:
 *         description: Descuento aplicado correctamente
 *       400:
 *         description: Código inválido o expirado
 */
router.post(
  "/pedidos/:id/descuento",
  checkRole("cliente"),
  DescuentosController.aplicarADescuento
);

module.exports = router;
