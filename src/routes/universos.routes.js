const express = require('express');
const router = express.Router();
const fabricanteController = require('../controllers/fabricante.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// middleware de autenticación y autorización
router.use(verifyToken);
router.use(checkRole(['admin', 'superadmin']));

// Rutas para fabricantes
router.get('/', fabricanteController.listarFabricantes);
router.get('/:id', fabricanteController.obtenerFabricante);
router.post('/', verifyToken, checkRole(['admin', 'superadmin']), fabricanteController.crearFabricante);
router.put('/:id', verifyToken, checkRole(['admin', 'superadmin']), fabricanteController.actualizarFabricante);
router.delete('/:id', verifyToken, checkRole(['admin', 'superadmin']), fabricanteController.eliminarFabricante);