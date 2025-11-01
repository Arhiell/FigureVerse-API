const express = require('express');
const router = express.Router();
const imagenController = require('../controllers/imagen.controller');
const { verifyToken, verifyRole } = require('../middlewares/authJwt');

// Middleware para proteger las rutas
router.use(verifyToken);

// CRUD
router.get('/', imagenController.listarImagenes);
router.get('/:id', imagenController.obtenerImagen);
router.post('/', verifyRole(['admin', 'super_admin']), imagenController.crearImagen);
router.put('/:id', verifyRole(['admin', 'super_admin']), imagenController.actualizarImagen);
router.delete('/:id', verifyRole(['admin', 'super_admin']), imagenController.eliminarImagen);

module.exports = router;
