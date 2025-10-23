const express = require("express");
const router = express.Router();

// Rutas de autenticación (se implementarán más adelante)
router.post("/register", (req, res) => {
  // Implementación pendiente
  res.status(501).json({ message: "Registro de usuario - No implementado" });
});

router.post("/login", (req, res) => {
  // Implementación pendiente
  res.status(501).json({ message: "Inicio de sesión - No implementado" });
});

router.post("/forgot-password", (req, res) => {
  // Implementación pendiente
  res.status(501).json({ message: "Recuperación de contraseña - No implementado" });
});

router.post("/reset-password", (req, res) => {
  // Implementación pendiente
  res.status(501).json({ message: "Restablecimiento de contraseña - No implementado" });
});

module.exports = router;