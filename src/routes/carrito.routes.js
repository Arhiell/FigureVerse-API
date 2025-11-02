/**
 * @swagger
 * tags:
 *   name: Carrito
 *   description: Endpoints para la gestión del carrito de compras
 */

/**
 * @swagger
 * /carrito:
 *   get:
 *     summary: Obtiene el carrito del usuario autenticado
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retorna el contenido actual del carrito.
 *       401:
 *         description: Token no válido o ausente.
 */

/**
 * @swagger
 * /carrito/agregar:
 *   post:
 *     summary: Agrega un producto al carrito
 *     tags: [Carrito]
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
 *               - cantidad
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 example: 7
 *               cantidad:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Producto agregado al carrito correctamente.
 *       400:
 *         description: Error en los datos proporcionados.
 *       401:
 *         description: Token inválido o expirado.
 */

/**
 * @swagger
 * /carrito/item/{id_detalle}:
 *   delete:
 *     summary: Elimina un producto del carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_detalle
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del detalle del carrito a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito correctamente.
 *       404:
 *         description: El producto no se encontró en el carrito.
 *       401:
 *         description: Token inválido o ausente.
 */

const express = require("express");
const router = express.Router();
const CarritoController = require("../controllers/carrito.controller");
const { authJwt } = require("../middlewares/authJwt");

// Middleware de autenticación
router.use(authJwt);

// Rutas del carrito
router.get("/", CarritoController.getCarrito);
router.post("/agregar", CarritoController.addItem);
router.delete("/item/:id_detalle", CarritoController.removeItem);

module.exports = router;
