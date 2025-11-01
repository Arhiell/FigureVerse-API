/**
 * Rutas para la gestión de productos
 */
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Middleware para proteger las rutas
router.use(verifyToken);


// CRUD
router.post('/', checkRole(['admin', 'superadmin']), productoController.crearProducto);
router.get('/', checkRole(['admin', 'cliente', 'superadmin']), productoController.listarProductos);
router.get('/:id', checkRole(['admin', 'cliente', 'superadmin']), productoController.obtenerProducto);
router.put('/:id', checkRole(['admin', 'superadmin']), productoController.actualizarProducto);
router.delete('/:id', checkRole(['admin', 'superadmin']), productoController.eliminarProducto);

module.exports = router;
