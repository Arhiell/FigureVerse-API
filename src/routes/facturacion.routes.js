/**
 * @swagger
 * tags:
 *   name: Facturación
 *   description: Endpoints relacionados con la emisión y gestión de facturas.
 */

/**
 * @swagger
 * /facturas/emitir/{id_pedido}:
 *   post:
 *     summary: Genera una factura asociada a un pedido existente.
 *     tags: [Facturación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_pedido
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido al que se emitirá la factura.
 *     responses:
 *       201:
 *         description: Factura emitida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_factura:
 *                       type: integer
 *                       example: 25
 *                     numero_factura:
 *                       type: string
 *                       example: "FV-2025-001234"
 *                     tipo_factura:
 *                       type: string
 *                       example: "B"
 *                     subtotal:
 *                       type: number
 *                       example: 12500.50
 *                     iva_monto:
 *                       type: number
 *                       example: 2625.11
 *                     total:
 *                       type: number
 *                       example: 15125.61
 *                     metodo_pago:
 *                       type: string
 *                       example: "Mercado Pago"
 *       400:
 *         description: Error en los datos enviados o pedido inválido.
 *       401:
 *         description: Token no válido o no enviado.
 *       403:
 *         description: El usuario no tiene permisos para emitir facturas.
 *       404:
 *         description: Pedido no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */

const express = require("express");
const router = express.Router();
const FacturacionController = require("../controllers/facturacion.controller");
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");

// Ruta protegida: solo "admin" o "super_admin" pueden emitir facturas
router.post(
  "/emitir/:id_pedido",
  authJwt,
  checkRole("admin", "super_admin"),
  FacturacionController.emitirFactura
);

module.exports = router;
