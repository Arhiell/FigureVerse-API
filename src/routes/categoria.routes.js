/**
 * @swagger
 * tags:
 *   name: Categorías
 *   description: Endpoints para la gestión de categorías de productos
 */

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Obtiene todas las categorías
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las categorías disponibles
 *       401:
 *         description: Token inválido o expirado
 */

/**
 * @swagger
 * /categorias/{id}:
 *   get:
 *     summary: Obtiene una categoría por su ID
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría a obtener
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 *       401:
 *         description: Token inválido o expirado
 */

/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Crea una nueva categoría
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_categoria
 *             properties:
 *               nombre_categoria:
 *                 type: string
 *                 example: "Figuras de acción"
 *               descripcion:
 *                 type: string
 *                 example: "Colección de figuras de acción articuladas."
 *     responses:
 *       201:
 *         description: Categoría creada correctamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Permisos insuficientes
 */

/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     summary: Actualiza una categoría existente
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_categoria:
 *                 type: string
 *                 example: "Funko Pop!"
 *               descripcion:
 *                 type: string
 *                 example: "Figuras de vinilo coleccionables"
 *     responses:
 *       200:
 *         description: Categoría actualizada correctamente
 *       404:
 *         description: Categoría no encontrada
 *       403:
 *         description: Permisos insuficientes
 */

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: Elimina una categoría existente
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría a eliminar
 *     responses:
 *       200:
 *         description: Categoría eliminada correctamente
 *       404:
 *         description: Categoría no encontrada
 *       403:
 *         description: Permisos insuficientes
 */

const express = require("express");
const router = express.Router();
const categoriaController = require("../controllers/categoria.controller");
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");

// Middleware de autenticación JWT
router.use(authJwt);

// CRUD de categorías
router.get("/", categoriaController.listarCategorias);
router.get("/:id", categoriaController.obtenerCategoria);
router.post(
  "/",
  checkRole("admin", "superadmin"),
  categoriaController.crearCategoria
);
router.put(
  "/:id",
  checkRole("admin", "superadmin"),
  categoriaController.actualizarCategoria
);
router.delete(
  "/:id",
  checkRole("admin", "superadmin"),
  categoriaController.eliminarCategoria
);

module.exports = router;
