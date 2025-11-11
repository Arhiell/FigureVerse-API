/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Endpoints para la gestión de productos del catálogo.
 */

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crea un nuevo producto (solo administradores).
 *     tags: [Productos]
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
 *               - precio_base
 *               - stock
 *               - id_categoria
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Iron Man Mark 85"
 *               descripcion:
 *                 type: string
 *                 example: "Figura coleccionable con detalles metálicos."
 *               precio_base:
 *                 type: number
 *                 example: 12500.5
 *               stock:
 *                 type: integer
 *                 example: 15
 *               stock_minimo:
 *                 type: integer
 *                 example: 3
 *               iva_porcentaje:
 *                 type: number
 *                 example: 21
 *               id_categoria:
 *                 type: integer
 *                 example: 1
 *               id_universo:
 *                 type: integer
 *                 example: 2
 *               id_fabricante:
 *                 type: integer
 *                 example: 5
 *               anio_lanzamiento:
 *                 type: integer
 *                 example: 2023
 *               escala:
 *                 type: string
 *                 example: "1/6"
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo]
 *                 example: "activo"
 *     responses:
 *       201:
 *         description: Producto creado correctamente.
 *       400:
 *         description: Datos inválidos o faltantes.
 *       403:
 *         description: Permisos insuficientes.
 *       401:
 *         description: Token inválido o ausente.
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Lista todos los productos disponibles.
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       401:
 *         description: Token inválido o no enviado.
 */

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtiene un producto específico por su ID.
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto.
 *     responses:
 *       200:
 *         description: Producto obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado.
 *       401:
 *         description: Token inválido o ausente.
 */

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualiza la información de un producto existente.
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Iron Man Mark 85 (versión mejorada)"
 *               precio_base:
 *                 type: number
 *                 example: 13500.99
 *               stock:
 *                 type: integer
 *                 example: 20
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo]
 *                 example: "activo"
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       404:
 *         description: Producto no encontrado.
 *       403:
 *         description: Permisos insuficientes.
 *       401:
 *         description: Token inválido o ausente.
 */

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Marca un producto como inactivo y elimina sus variantes e imágenes (solo administradores).
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a eliminar.
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente, variantes e imágenes asociadas removidas.
 *       404:
 *         description: Producto no encontrado.
 *       403:
 *         description: Permisos insuficientes.
 *       401:
 *         description: Token inválido o ausente.
 */

const express = require("express");
const router = express.Router();
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");
const productoController = require("../controllers/producto.controller");

// Middleware global: requiere autenticación JWT
router.use(authJwt);

// Rutas CRUD
router.post(
  "/",
  checkRole("admin", "super_admin"),
  productoController.crearProducto
);
router.get(
  "/",
  checkRole("admin", "cliente", "super_admin"),
  productoController.listarProductos
);
router.get(
  "/:id",
  checkRole("admin", "cliente", "super_admin"),
  productoController.obtenerProducto
);
router.put(
  "/:id",
  checkRole("admin", "super_admin"),
  productoController.actualizarProducto
);
router.delete(
  "/:id",
  checkRole("admin", "super_admin"),
  productoController.eliminarProducto
);

module.exports = router;
