/**
 * Servicios de autenticación
 * @module services/auth
 */
const AuthService = require("../services/auth.service");

/**
 * Controlador de autenticación
 * Gestiona las peticiones HTTP relacionadas con la autenticación
 * @namespace AuthController
 */
const AuthController = {
  /**
   * Registra un nuevo usuario en el sistema
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el resultado del registro
   */
  register: async (req, res) => {
    try {
      const { nombre_usuario, email, password } = req.body;

      // Validaciones básicas de campos requeridos
      if (!nombre_usuario || !email || !password) {
        return res.status(400).json({
          error: "Todos los campos son obligatorios",
        });
      }

      // Por defecto, los usuarios registrados tienen rol "user"
      const newUser = await AuthService.register({
        nombre_usuario: nombre_usuario,
        email,
        password,
        role: "cliente",
      });

      res.status(201).json({
        ok: true,
        message: "Usuario registrado correctamente",
        user: newUser,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error.message,
      });
    }
  },

  /**
   * Registra un nuevo administrador (solo superadmin)
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el resultado del registro
   */
  registerAdmin: async (req, res) => {
    try {
      // Verificar que el usuario que hace la petición es superadmin
      const role = req.user?.role || req.user?.rol;
      const isSuperAdmin = role === "superadmin" || role === "super_admin";
      if (!isSuperAdmin) {
        return res.status(403).json({
          error: "No tienes permisos para registrar administradores",
        });
      }

      const { nombre_usuario, email, password } = req.body;

      // Validaciones básicas de campos requeridos
      if (!nombre_usuario || !email || !password) {
        return res.status(400).json({
          error: "Todos los campos son obligatorios",
        });
      }

      // Registrar usuario con rol "admin"
      const newAdmin = await AuthService.register({
        nombre_usuario: nombre_usuario,
        email,
        password,
        role: "admin",
      });

      res.status(201).json({
        ok: true,
        message: "Administrador registrado correctamente",
        user: newAdmin,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error.message,
      });
    }
  },

  // Autentica a un usuario existente

  login: async (req, res) => {
    try {
      const { nombre_usuario, email, password } = req.body;

      if ((!email && !nombre_usuario) || !password) {
        return res.status(400).json({
          ok: false,
          error: "Debe proporcionar nombre de usuario o email, y contraseña",
        });
      }

      const result = await AuthService.login({
        nombre_usuario,
        email,
        password,
      });

      res.status(200).json({
        ok: true,
        message: "Inicio de sesión exitoso",
        ...result,
      });
    } catch (error) {
      res.status(401).json({
        ok: false,
        error: error.message,
      });
    }
  },

  profile: async (req, res) => {
    try {
      // El middleware authJwt ya ha verificado el token y añadido req.user
      res.status(200).json({
        ok: true,
        user: req.user,
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error.message,
      });
    }
  },
};

module.exports = AuthController;
