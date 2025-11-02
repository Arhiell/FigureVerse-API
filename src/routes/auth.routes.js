/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para registro, inicio de sesión y autenticación de usuarios.
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario en el sistema.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - email
 *               - password
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: "ArielDev"
 *               email:
 *                 type: string
 *                 example: "ariel@figureverse.com"
 *               password:
 *                 type: string
 *                 example: "12345678"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *       400:
 *         description: Datos inválidos o email ya registrado.
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión y obtiene el token JWT.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ariel@figureverse.com"
 *               password:
 *                 type: string
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: Login exitoso.
 *       401:
 *         description: Credenciales incorrectas.
 */

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario autenticado.
 *       401:
 *         description: Token inválido o expirado.
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Redirige a la autenticación con Google.
 *     tags: [Autenticación]
 *     responses:
 *       302:
 *         description: Redirección al proveedor de autenticación (Google).
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback de autenticación con Google.
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Login con Google exitoso.
 *       401:
 *         description: Falló la autenticación con Google.
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicita restablecimiento de contraseña.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ariel@figureverse.com"
 *     responses:
 *       501:
 *         description: Funcionalidad no implementada.
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablece la contraseña del usuario.
 *     tags: [Autenticación]
 *     responses:
 *       501:
 *         description: Funcionalidad no implementada.
 */

/**
 * @swagger
 * /auth/admin/register:
 *   post:
 *     summary: Registra un nuevo administrador (solo super_admin).
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Administrador registrado correctamente.
 *       403:
 *         description: Acceso denegado. Solo super_admin autorizado.
 */

const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/auth.controller");
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");
const validator = require("../middlewares/validators/validator");
const {
  registerSchema,
  loginSchema,
  updateSchema,
} = require("../middlewares/validators/validate_user");

/**
 * Módulo de rutas de autenticación
 * Gestiona todas las rutas relacionadas con la autenticación de usuarios
 * @module routes/auth
 */

// Rutas públicas
router.post("/register", validator(registerSchema), AuthController.register);
router.post("/login", validator(loginSchema), AuthController.login);

// Login con Google (OAuth)
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

// Perfil de usuario autenticado
router.get("/profile", authJwt, AuthController.profile);

// Recuperación / Restablecimiento (no implementado aún)
router.post("/forgot-password", (req, res) => {
  res.status(501).json({
    message: "Recuperación de contraseña - No implementado",
  });
});

router.post("/reset-password", (req, res) => {
  res.status(501).json({
    message: "Restablecimiento de contraseña - No implementado",
  });
});

// Registro de administradores (solo super_admin)
router.post(
  "/admin/register",
  authJwt,
  checkRole("super_admin"),
  AuthController.registerAdmin
);

module.exports = router;
