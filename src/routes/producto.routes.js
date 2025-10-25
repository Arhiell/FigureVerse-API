/**
 * Rutas para la gestión de productos
 */
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');

// CRUD
router.post('/', productoController.crearProducto);
router.get('/', productoController.listarProductos);
router.get('/:id', productoController.obtenerProducto);
router.put('/:id', productoController.actualizarProducto);
router.delete('/:id', productoController.eliminarProducto);

module.exports = router;
