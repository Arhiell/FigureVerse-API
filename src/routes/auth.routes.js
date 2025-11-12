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
 *               role:
 *                 type: string
 *                 description: Rol del usuario (por defecto "cliente")
 *                 enum: [cliente, admin, super_admin]
 *                 example: "cliente"
 *               nombre:
 *                 type: string
 *                 description: Nombre real del cliente (requerido si role=cliente)
 *               apellido:
 *                 type: string
 *                 description: Apellido del cliente (requerido si role=cliente)
 *               dni:
 *                 type: string
 *                 description: Documento del cliente (requerido si role=cliente)
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *                 description: Dirección principal (requerido si role=cliente)
 *               numero:
 *                 type: string
 *               piso:
 *                 type: string
 *               departamento:
 *                 type: string
 *               referencia:
 *                 type: string
 *               ciudad:
 *                 type: string
 *                 description: Ciudad (requerido si role=cliente)
 *               provincia:
 *                 type: string
 *                 description: Provincia (requerido si role=cliente)
 *               pais:
 *                 type: string
 *                 description: País (opcional, default 'Argentina')
 *               codigo_postal:
 *                 type: string
 *                 description: Código postal (requerido si role=cliente)
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento (opcional)
 *           examples:
 *             cliente_minimo:
 *               summary: Registro simple que crea usuario y perfil de cliente
 *               value:
 *                 nombre_usuario: "Arielo"
 *                 email: "arielo@figureverse.com"
 *                 password: "12345678"
 *                 role: "cliente"
 *                 nombre: "Ariel"
 *                 apellido: "Domínguez"
 *                 dni: "38222111"
 *                 direccion: "Av. Siempre Viva 742"
 *                 ciudad: "Posadas"
 *                 provincia: "Misiones"
 *                 codigo_postal: "3300"
 *             cliente_completo:
 *               summary: Registro con datos completos de cliente
 *               value:
 *                 nombre_usuario: "Arielo"
 *                 email: "arielo@figureverse.com"
 *                 password: "12345678"
 *                 role: "cliente"
 *                 nombre: "Ariel"
 *                 apellido: "Domínguez"
 *                 dni: "38222111"
 *                 telefono: "3794112233"
 *                 direccion: "Av. Siempre Viva 742"
 *                 numero: "742"
 *                 piso: "2"
 *                 departamento: "B"
 *                 referencia: "Frente a la plaza"
 *                 ciudad: "Posadas"
 *                 provincia: "Misiones"
 *                 pais: "Argentina"
 *                 codigo_postal: "3300"
 *                 fecha_nacimiento: "1990-05-12"
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

/* (Swagger eliminado) Flujo de restablecimiento por token deshabilitado */

/* (Swagger eliminado) Flujo de restablecimiento por token deshabilitado */

/**
 * @swagger
 * /auth/admin/register:
 *   post:
 *     summary: Registrar administrador (usuario + perfil administrador).
 *     description: "Crea un nuevo usuario con rol 'admin' en la tabla `usuarios` y su perfil correspondiente en la tabla `administradores`, todo dentro de una única transacción. Solo los usuarios con rol `super_admin` pueden crear nuevos administradores. Se requiere un token JWT válido en el encabezado Authorization: Bearer <token>. Campos obligatorios del perfil admin: `nombre`, `apellido`, `dni`, `cargo`. Campos opcionales: `telefono`, `area`."
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
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
 *               - nombre
 *               - apellido
 *               - dni
 *               - cargo
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: "MarcoAdmin"
 *               email:
 *                 type: string
 *                 example: "marco@figureverse.com"
 *               password:
 *                 type: string
 *                 example: "12345678"
 *               nombre:
 *                 type: string
 *                 example: "Marco"
 *               apellido:
 *                 type: string
 *                 example: "Sosca"
 *               dni:
 *                 type: string
 *                 example: "38222111"
 *               telefono:
 *                 type: string
 *                 example: "3794112233"
 *               cargo:
 *                 type: string
 *                 example: "Supervisor de Ventas"
 *               area:
 *                 type: string
 *                 enum: [ventas, inventario, marketing, soporte, otro]
 *                 example: "ventas"
 *     responses:
 *       201:
 *         description: Administrador registrado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               message: "Administrador registrado correctamente"
 *               user:
 *                 id_usuario: 6
 *                 nombre_usuario: "MarcoAdmin"
 *                 email: "marco@figureverse.com"
 *                 rol: "admin"
 *                 estado: "activo"
 *       401:
 *         description: Token inválido o expirado.
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               error: "Token inválido o expirado"
 *       400:
 *         description: Datos inválidos o campos faltantes.
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               error: "El correo electrónico ya está registrado"
 *       403:
 *         description: Acceso denegado. Solo super_admin autorizado.
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               error: "No tienes permisos para registrar administradores"
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
  requestOtpSchema,
} = require("../middlewares/validators/validate_user");
const OTPService = require("../services/otp.service");
// Eliminado el flujo de restablecimiento por token; se mantiene solo OTP
const UserService = require("../services/user.service");
const bcrypt = require("bcryptjs");
const EmailService = require("../services/email.service");

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
router.get("/profile", authJwt, AuthController.profile,
);

/**
 * @swagger
 * /auth/password/request-otp:
 *   post:
 *     summary: Genera y envía un OTP para cambio de contraseña (usuario autenticado)
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           examples:
 *             default:
 *               value:
 *                 purpose: "password_change"
 *                 delivery: "email"
 *     responses:
 *       200:
 *         description: OTP generado y enviado (email)
 */
router.post(
  "/password/request-otp",
  authJwt,
  validator(requestOtpSchema),
  async (req, res, next) => {
    try {
      const id = req.user?.id_usuario;
      const { purpose } = req.body;
      const { code, expiresAt } = await OTPService.generate(id, purpose);

      // Obtener email del usuario desde la base de datos
      const user = await UserService.getById(id);
      if (!user || !user.email) {
        return res
          .status(400)
          .json({ ok: false, error: "El usuario no tiene un email válido configurado" });
      }

      // Enviar OTP por correo
      const ttlSeconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      await EmailService.sendOtpEmail(user.email, code, ttlSeconds);

      const debug = process.env.OTP_DEBUG === "true";
      res.status(200).json({
        ok: true,
        message: "OTP generado",
        expires_in: ttlSeconds,
        ...(debug ? { code } : {}),
      });
    } catch (err) {
      next(err);
    }
  }
);



// Registro de administradores (solo super_admin)
router.post(
  "/admin/register",
  authJwt,
  checkRole("super_admin"),
  AuthController.registerAdmin
);

module.exports = router;
