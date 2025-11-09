/**
 * @swagger
 * tags:
 *   name: Empresa
 *   description: Configuración de la empresa (solo admin/super_admin)
 */

const express = require("express");
const router = express.Router();
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");
const validator = require("../middlewares/validators/validator");
const { updateCompanySettingsSchema } = require("../middlewares/validators/validate_company");
const CompanyService = require("../services/company.service");

// Proteger todas las rutas con JWT
router.use(authJwt);

/**
 * @swagger
 * /company/settings:
 *   get:
 *     summary: Obtener configuración actual de la empresa
 *     tags: [Empresa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración obtenida
 *       403:
 *         description: Permisos insuficientes
 */
router.get("/settings", checkRole("admin", "super_admin", "superadmin"), async (req, res, next) => {
  try {
    const settings = await CompanyService.getSettings();
    res.status(200).json({ ok: true, data: settings });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /company/settings:
 *   put:
 *     summary: Actualizar configuración de la empresa (parcial)
 *     tags: [Empresa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           examples:
 *             ejemplo:
 *               value:
 *                 from_name: "FigureVerse"
 *                 from_email: "tanototo4@gmail.com"
 *                 telefono: "+54 9 11 1234-5678"
 *                 direccion: "Av. Siempre Viva 742"
 *                 ciudad: "Posadas"
 *                 provincia: "Misiones"
 *                 pais: "Argentina"
 *                 codigo_postal: "3300"
 *                 instagram: "https://instagram.com/figureverse"
 *                 facebook: "https://facebook.com/figureverse"
 *     responses:
 *       200:
 *         description: Configuración actualizada
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Permisos insuficientes
 */
router.put(
  "/settings",
  checkRole("admin", "super_admin", "superadmin"),
  validator(updateCompanySettingsSchema),
  async (req, res, next) => {
    try {
      const updated = await CompanyService.upsertSettings(req.body);
      res.status(200).json({ ok: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;