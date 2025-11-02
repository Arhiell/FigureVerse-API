/**
 * @swagger
 * tags:
 *   name: Imágenes
 *   description: Endpoints para la gestión de imágenes asociadas a productos.
 */

/**
 * @swagger
 * /api/imagenes:
 *   get:
 *     summary: Obtiene la lista de todas las imágenes registradas.
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de imágenes obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Imagen'
 *       401:
 *         description: Token inválido o ausente.
 */

/**
 * @swagger
 * /api/imagenes/{id}:
 *   get:
 *     summary: Obtiene los datos de una imagen específica por ID.
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la imagen a obtener.
 *     responses:
 *       200:
 *         description: Imagen obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Imagen'
 *       404:
 *         description: Imagen no encontrada.
 *       401:
 *         description: Token inválido o ausente.
 */

/**
 * @swagger
 * /api/imagenes:
 *   post:
 *     summary: Crea una nueva imagen (solo administradores).
 *     tags: [Imágenes]
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
 *               - url
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 example: 12
 *               url:
 *                 type: string
 *                 example: "https://cdn.figureverse.com/products/ironman01.png"
 *               descripcion:
 *                 type: string
 *                 example: "Vista frontal de la figura Iron Man Mark 85"
 *     responses:
 *       201:
 *         description: Imagen creada correctamente.
 *       400:
 *         description: Datos inválidos o faltantes.
 *       403:
 *         description: Permisos insuficientes.
 *       401:
 *         description: Token inválido o ausente.
 */

/**
 * @swagger
 * /api/imagenes/{id}:
 *   put:
 *     summary: Actualiza los datos de una imagen (solo administradores).
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la imagen a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://cdn.figureverse.com/products/ironman01-updated.png"
 *               descripcion:
 *                 type: string
 *                 example: "Vista lateral con nueva base iluminada"
 *     responses:
 *       200:
 *         description: Imagen actualizada correctamente.
 *       400:
 *         description: Datos inválidos.
 *       404:
 *         description: Imagen no encontrada.
 *       403:
 *         description: Permisos insuficientes.
 *       401:
 *         description: Token inválido o ausente.
 */

/**
 * @swagger
 * /api/imagenes/{id}:
 *   delete:
 *     summary: Elimina una imagen (solo administradores).
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la imagen a eliminar.
 *     responses:
 *       200:
 *         description: Imagen eliminada correctamente.
 *       404:
 *         description: Imagen no encontrada.
 *       403:
 *         description: Permisos insuficientes.
 *       401:
 *         description: Token inválido o ausente.
 */

const express = require("express");
const router = express.Router();
const imagenController = require("../controllers/imagen.controller");
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");

// Middleware global: requiere autenticación
router.use(authJwt);

// Endpoints CRUD de imágenes
router.get("/", imagenController.listarImagenes);
router.get("/:id", imagenController.obtenerImagen);
router.post(
  "/",
  checkRole("admin", "super_admin"),
  imagenController.crearImagen
);
router.put(
  "/:id",
  checkRole("admin", "super_admin"),
  imagenController.actualizarImagen
);
router.delete(
  "/:id",
  checkRole("admin", "super_admin"),
  imagenController.eliminarImagen
);

module.exports = router;
