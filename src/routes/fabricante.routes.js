const express = require('express');
const router = express.Router();
const fabricanteController = require('../controllers/fabricante.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Middleware para proteger las rutas
router.use(verifyToken);


router.get('/', fabricanteController.listarFabricantes);
router.get('/:id', fabricanteController.obtenerFabricante);
router.post('/', checkRole(['admin', 'superadmin']), fabricanteController.crearFabricante);
router.put('/:id', checkRole(['admin', 'superadmin']), fabricanteController.actualizarFabricante);
router.delete('/:id', checkRole(['admin', 'superadmin']), fabricanteController.eliminarFabricante);

module.exports = router;
