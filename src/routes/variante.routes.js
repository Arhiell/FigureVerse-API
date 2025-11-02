/**
 * @swagger
 * tags:
 *   name: Variantes
 *   description: Endpoints para la gestión de variantes de productos (por ejemplo, color, tamaño, edición limitada, etc.)
 */

/**
 * @swagger
 * /api/variantes:
 *   get:
 *     summary: Lista todas las variantes disponibles o filtra por producto.
 *     tags: [Variantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_producto
 *         schema:
 *           type: integer
 *         description: ID del producto para filtrar las variantes.
 *     responses:
 *       200:
 *         description: Lista de variantes obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Variante'
 *       401:
 *         description: Token inválido o no enviado.
 */

/**
 * @swagger
 * /api/variantes/{id}:
 *   get:
 *     summary: Obtiene una variante específica por su ID.
 *     tags: [Variantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la variante a obtener.
 *     responses:
 *       200:
 *         description: Variante obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Variante'
 *       404:
 *         description: Variante no encontrada.
 *       401:
 *         description: Token inválido o ausente.
 */

/**
 * @swagger
 * /api/variantes:
 *   post:
 *     summary: Crea una nueva variante (solo administradores).
 *     tags: [Variantes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_producto
 *               - nombre
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 example: 12
 *               nombre:
 *                 type: string
 *                 example: "Iron Man Mark 85 - Edición dorada"
 *               color:
 *                 type: string
 *                 example: "Dorado metálico"
 *               tamano:
 *                 type: string
 *                 example: "30cm"
 *               stock:
 *                 type: integer
 *                 example: 5
 *               precio_adicional:
 *                 type: number
 *                 example: 2500.0
 *     responses:
 *       201:
 *         description: Variante creada correctamente.
 *       400:
 *         description: Datos inválidos o faltantes.
 *       403:
 *         description: Permisos insuficientes.
 *       401:
 *         description: Token inválido o ausente.
 */

/**
 * @swagger
 * /api/variantes/{id}:
 *   put:
 *     summary: Actualiza los datos de una variante (solo administradores).
 *     tags: [Variantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la variante a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Iron Man Mark 85 - Actualización base LED"
 *               color:
 *                 type: string
 *                 example: "Rojo metálico"
 *               stock:
 *                 type: integer
 *                 example: 8
 *               precio_adicional:
 *                 type: number
 *                 example: 2700.0
 *     responses:
 *       200:
 *         description: Variante actualizada correctamente.
 *       404:
 *         description: Variante no encontrada.
 *       403:
 *         description: Permisos insuficientes.
 *       401:
 *         description: Token inválido o ausente.
 */

/**
 * @swagger
 * /api/variantes/{id}:
 *   delete:
 *     summary: Elimina una variante (solo administradores).
 *     tags: [Variantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la variante a eliminar.
 *     responses:
 *       200:
 *         description: Variante eliminada correctamente.
 *       404:
 *         description: Variante no encontrada.
 *       403:
 *         description: Permisos insuficientes.
 *       401:
 *         description: Token inválido o ausente.
 */

const express = require("express");
const router = express.Router();
const varianteController = require("../controllers/variante.controllers");
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");

// Middleware para proteger las rutas
router.use(authJwt);

// CRUD de variantes
router.get("/", varianteController.listarVariantes);
router.get("/:id", varianteController.obtenerVariante);
router.post(
  "/",
  checkRole("admin", "super_admin"),
  varianteController.crearVariante
);
router.put(
  "/:id",
  checkRole("admin", "super_admin"),
  varianteController.actualizarVariante
);
router.delete(
  "/:id",
  checkRole("admin", "super_admin"),
  varianteController.eliminarVariante
);

module.exports = router;
