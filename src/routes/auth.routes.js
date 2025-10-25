/**
 * Módulo de rutas de autenticación
 * Gestiona todas las rutas relacionadas con la autenticación de usuarios
 * @module routes/auth
 */
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/auth");
const validator = require("../middlewares/validator");
const {registerSchema,loginSchema,updateSchema} = require("../middlewares/validate");

// Rutas públicas de autenticación
router.post("/register", validator(registerSchema), AuthController.register);

router.post("/login", validator(loginSchema), AuthController.login);

// Login con Google
router.get(
  "/google",
  require("../config/passport").authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  require("../config/passport").authenticate("google", { session: false }),
  (req, res) => {
    res.json({
      message: "Login con Google exitoso",
      user: req.user.user,
      token: req.user.token,
    });
  }
);

router.get("/profile", authJwt, AuthController.profile);

/**
 * Rutas para recuperación de contraseña
 * Pendientes de implementación completa
 */
router.post("/forgot-password", (req, res) => {
  res
    .status(501)
    .json({ message: "Recuperación de contraseña - No implementado" });
});

router.post("/reset-password", (req, res) => {
  res
    .status(501)
    .json({ message: "Restablecimiento de contraseña - No implementado" });
});

/**
 * Ruta para registro de administradores
 * Solo accesible por superadmins (pendiente de verificación de rol)
 */
router.post(
  "/admin/register",
  authJwt,
  checkRole("superadmin"),
  AuthController.registerAdmin
);

module.exports = router;
