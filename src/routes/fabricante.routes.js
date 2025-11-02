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
 *       401:
 *         description: Token inválido o no proporcionado.
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
 *         description: Datos del fabricante obtenidos correctamente.
 *       404:
 *         description: Fabricante no encontrado.
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
 *                 example: "Bandai"
 *               pais_origen:
 *                 type: string
 *                 example: "Japón"
 *               descripcion:
 *                 type: string
 *                 example: "Fabricante líder en figuras coleccionables."
 *     responses:
 *       201:
 *         description: Fabricante creado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       403:
 *         description: Permisos insuficientes.
 */

/**
 * @swagger
 * /fabricantes/{id}:
 *   put:
 *     summary: Actualiza los datos de un fabricante existente (solo administradores).
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Good Smile Company"
 *               pais_origen:
 *                 type: string
 *                 example: "Japón"
 *               descripcion:
 *                 type: string
 *                 example: "Fabricante especializado en figuras Nendoroid."
 *     responses:
 *       200:
 *         description: Fabricante actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       404:
 *         description: Fabricante no encontrado.
 *       403:
 *         description: Permisos insuficientes.
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
 *         description: ID del fabricante.
 *     responses:
 *       200:
 *         description: Fabricante eliminado correctamente.
 *       404:
 *         description: Fabricante no encontrado.
 *       403:
 *         description: Permisos insuficientes.
 */

const express = require("express");
const router = express.Router();
const fabricanteController = require("../controllers/fabricante.controller");
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");

// Middleware global: solo usuarios autenticados
router.use(authJwt);

// Endpoints CRUD de fabricantes
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
