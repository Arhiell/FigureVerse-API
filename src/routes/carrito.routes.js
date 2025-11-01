const express = require("express");
const router = express.Router();
const CarritoController = require("../controllers/carrito.controller");
const { verifyToken } = require("../middlewares/authJwt");


router.get("/", verifyToken, CarritoController.getCarrito);
router.post("/agregar", verifyToken, CarritoController.addItem);
router.delete("/item/:id_detalle", verifyToken, CarritoController.removeItem);

module.exports = router;
