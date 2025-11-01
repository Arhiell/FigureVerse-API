const express = require('express');
const router = express.Router();
const varianteController = require('../controllers/variante.controller');
const { verifyToken, verifyRole } = require('../middlewares/authJwt');

// Middleware para proteger las rutas
router.use(verifyToken);


// CRUD
router.get('/', varianteController.listarVariantes);
router.get('/:id', varianteController.obtenerVariante);
router.post('/', verifyRole(['admin', 'super_admin']), varianteController.crearVariante);
router.put('/:id', verifyRole(['admin', 'super_admin']), varianteController.actualizarVariante);
router.delete('/:id', verifyRole(['admin', 'super_admin']), varianteController.eliminarVariante);

module.exports = router;
