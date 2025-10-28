const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Middleware para proteger las rutas
router.use(verifyToken);
router.use(checkRole(['admin', 'cliente', 'superadmin']));

router.get('/', categoriaController.listarCategorias);
router.get('/:id', categoriaController.obtenerCategoria);
router.post('/', checkRole(['admin', 'superadmin']), categoriaController.crearCategoria);
router.put('/:id', checkRole(['admin', 'superadmin']), categoriaController.actualizarCategoria);
router.delete('/:id', checkRole(['admin', 'superadmin']), categoriaController.eliminarCategoria);

module.exports = router;
