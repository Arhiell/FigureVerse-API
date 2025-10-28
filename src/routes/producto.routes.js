/**
 * Rutas para la gestión de productos
 */
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Middleware para proteger las rutas
router.use(verifyToken);
router.use(checkRole(['admin', 'cliente', 'superadmin']));

// CRUD
router.post('/', verifyToken, checkRole(['admin', 'superadmin']), productoController.crearProducto);
router.get('/', verifyToken, checkRole(['admin', 'cliente', 'superadmin']), productoController.listarProductos);
router.get('/:id', verifyToken, checkRole(['admin', 'cliente', 'superadmin']), productoController.obtenerProducto);
router.put('/:id', verifyToken, checkRole(['admin', 'superadmin']), productoController.actualizarProducto);
router.delete('/:id', verifyToken, checkRole(['admin', 'superadmin']), productoController.eliminarProducto);

module.exports = router;
