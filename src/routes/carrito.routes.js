const express = require("express");
const router = express.Router();
const CarritoController = require("../controllers/carrito.controller");
const { verifyToken } = require("../middlewares/authJwt");

// middelewares de autenticación
router.use(verifyToken);

router.get("/", CarritoController.getCarrito);
router.post("/agregar", CarritoController.addItem);
router.delete("/item/:id_detalle", CarritoController.removeItem);

module.exports = router;
