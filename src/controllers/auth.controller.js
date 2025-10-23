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
          error: "Todos los campos son obligatorios" 
        });
      }
      
      const newUser = await AuthService.register({ nombre_usuario, email, password });
      
      res.status(201).json({
        ok: true,
        message: "Usuario registrado correctamente",
        user: newUser
      });
    } catch (error) {
      res.status(400).json({ 
        ok: false, 
        error: error.message 
      });
    }
  },
  
  /**
   * Autentica a un usuario existente
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con token y datos del usuario
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validaciones básicas de campos requeridos
      if (!email || !password) {
        return res.status(400).json({ 
          error: "Email y contraseña son obligatorios" 
        });
      }
      
      const result = await AuthService.login({ email, password });
      
      res.status(200).json({
        ok: true,
        message: "Inicio de sesión exitoso",
        ...result
      });
    } catch (error) {
      res.status(401).json({ 
        ok: false, 
        error: error.message 
      });
    }
  },
  
  profile: async (req, res) => {
    try {
      // El middleware authJwt ya ha verificado el token y añadido req.user
      res.status(200).json({
        ok: true,
        user: req.user
      });
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        error: error.message 
      });
    }
  }
};

module.exports = AuthController;