/**
 * Rutas de usuarios (administración)
 */
const express = require("express");
const router = express.Router();
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/auth");
const UserService = require("../services/user.service");

/**
 * Cambiar estado de usuario (admin/superadmin)
 */
router.patch("/:id/status", authJwt, checkRole(["admin", "superadmin", "super_admin"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { estado } = req.body; // 'activo' | 'inhabilitado'
    if (!id || !estado || !["activo", "inhabilitado"].includes(estado)) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    await UserService.updateStatus(id, estado);
    res.status(200).json({ ok: true, message: "Estado actualizado" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;