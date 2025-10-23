/**
 * Módulo de rutas de autenticación
 * Gestiona todas las rutas relacionadas con la autenticación de usuarios
 * @module routes/auth
 */
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { authJwt } = require("../middlewares/authJwt");

/**
 * Rutas públicas de autenticación
 * No requieren token JWT para ser accedidas
 */
router.post("/register", AuthController.register);  // Registro de nuevos usuarios
router.post("/login", AuthController.login);        // Inicio de sesión de usuarios existentes

/**
 * Rutas protegidas por autenticación
 * Requieren token JWT válido para ser accedidas
 */
router.get("/profile", authJwt, AuthController.profile);  // Obtiene el perfil del usuario autenticado

/**
 * Rutas para recuperación de contraseña
 * Pendientes de implementación completa
 */
router.post("/forgot-password", (req, res) => {
  res.status(501).json({ message: "Recuperación de contraseña - No implementado" });
});

router.post("/reset-password", (req, res) => {
  res.status(501).json({ message: "Restablecimiento de contraseña - No implementado" });
});

module.exports = router;