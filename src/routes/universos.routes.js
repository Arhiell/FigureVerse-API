/**
 * @swagger
 * tags:
 *   name: Fabricantes
 *   description: Endpoints para la gestión de fabricantes de productos.
 */

/**
 * @swagger
 * /fabricantes:
 *   get:
 *     summary: Lista todos los fabricantes registrados.
 *     tags: [Fabricantes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de fabricantes obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fabricante'
 *       401:
 *         description: Token inválido o no enviado.
 */

/**
 * @swagger
 * /fabricantes/{id}:
 *   get:
 *     summary: Obtiene la información de un fabricante por su ID.
 *     tags: [Fabricantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del fabricante.
 *     responses:
 *       200:
 *         description: Fabricante obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fabricante'
 *       404:
 *         description: Fabricante no encontrado.
 *       401:
 *         description: Token inválido o no enviado.
 */

/**
 * @swagger
 * /fabricantes:
 *   post:
 *     summary: Crea un nuevo fabricante (solo administradores).
 *     tags: [Fabricantes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Hot Toys"
 *               pais_origen:
 *                 type: string
 *                 example: "Hong Kong"
 *               descripcion:
 *                 type: string
 *                 example: "Fabricante premium de figuras de colección escala 1/6."
 *     responses:
 *       201:
 *         description: Fabricante creado correctamente.
 *       400:
 *         description: Datos inválidos o faltantes.
 *       403:
 *         description: Permisos insuficientes.
 *       401:
 *         description: Token inválido o no enviado.
 */

/**
 * @swagger
 * /fabricantes/{id}:
 *   put:
 *     summary: Actualiza la información de un fabricante existente.
 *     tags: [Fabricantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del fabricante a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Hot Toys Limited"
 *               pais_origen:
 *                 type: string
 *                 example: "China"
 *               descripcion:
 *                 type: string
 *                 example: "Fabricante con distribución internacional."
 *     responses:
 *       200:
 *         description: Fabricante actualizado correctamente.
 *       404:
 *         description: Fabricante no encontrado.
 *       403:
 *         description: Permisos insuficientes.
 *       401:
 *         description: Token inválido o no enviado.
 */

/**
 * @swagger
 * /fabricantes/{id}:
 *   delete:
 *     summary: Elimina un fabricante (solo administradores).
 *     tags: [Fabricantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del fabricante a eliminar.
 *     responses:
 *       200:
 *         description: Fabricante eliminado correctamente.
 *       404:
 *         description: Fabricante no encontrado.
 *       403:
 *         description: Permisos insuficientes.
 *       401:
 *         description: Token inválido o no enviado.
 */

const express = require("express");
const router = express.Router();
const fabricanteController = require("../controllers/fabricante.controller");
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");

// Middleware de autenticación
router.use(authJwt);

// Endpoints CRUD
router.get("/", fabricanteController.listarFabricantes);
router.get("/:id", fabricanteController.obtenerFabricante);
router.post(
  "/",
  checkRole("admin", "superadmin"),
  fabricanteController.crearFabricante
);
router.put(
  "/:id",
  checkRole("admin", "superadmin"),
  fabricanteController.actualizarFabricante
);
router.delete(
  "/:id",
  checkRole("admin", "superadmin"),
  fabricanteController.eliminarFabricante
);

module.exports = router;
