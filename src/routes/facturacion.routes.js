const express = require("express");
const router = express.Router();
const FacturacionController = require("../controllers/facturacion.controller");
const { verifyToken, verifyRole } = require("../middlewares/authJwt");

router.post("/emitir/:id_pedido", verifyToken, verifyRole(["admin", "super_admin"]), FacturacionController.emitirFactura);

module.exports = router;
