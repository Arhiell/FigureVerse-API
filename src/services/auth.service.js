/**
 * Módulo para encriptación de contraseñas
 */
const bcrypt = require("bcryptjs");
/**
 * Conexión a la base de datos MySQL
 */
const pool = require("../config/db");
/**
 * Utilidad para generación de tokens JWT
 */
const { generateToken } = require("../config/jwt");

/**
 * Servicio de autenticación
 * Contiene la lógica de negocio para registro y autenticación de usuarios
 */
const AuthService = {
  /**
   * Registra un nuevo usuario en la base de datos
   * @async
   * @param {Object} userData - Datos del usuario a registrar
   * @param {string} userData.nombre_usuario - Nombre del usuario
   * @param {string} userData.email - Correo electrónico del usuario
   * @param {string} userData.password - Contraseña sin encriptar
   * @returns {Object} Datos del usuario registrado (sin contraseña)
   * @throws {Error} Si el correo ya está registrado
   */
  register: async ({ nombre_usuario, email, password }) => {
    const conn = await pool.getConnection();
    try {
      // Verificar si el correo ya existe en la base de datos
      const [userExists] = await conn.query("SELECT id_usuario FROM usuario WHERE email = ?", [email]);
      
      if (userExists.length > 0) {
        throw new Error("El correo electrónico ya está registrado");
      }
      
      // Encriptar la contraseña antes de almacenarla
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insertar el nuevo usuario en la base de datos
      const [result] = await conn.query(
        "INSERT INTO usuario (nombre_usuario, email, password) VALUES (?, ?, ?)",
        [nombre_usuario, email, hashedPassword]
      );
      
      return { id_usuario: result.insertId, nombre_usuario, email };
    } finally {
      conn.release(); // Liberar la conexión al pool
    }
  },
  
  /**
   * Autentica a un usuario y genera un token JWT
   * @async
   * @param {Object} credentials - Credenciales de acceso
   * @param {string} credentials.email - Correo electrónico del usuario
   * @param {string} credentials.password - Contraseña sin encriptar
   * @returns {Object} Token JWT y datos del usuario
   * @throws {Error} Si las credenciales son inválidas
   */
  login: async ({ email, password }) => {
    const conn = await pool.getConnection();
    try {
      const [users] = await conn.query("SELECT * FROM usuario WHERE email = ?", [email]);
      
      if (users.length === 0) {
        throw new Error("Credenciales inválidas");
      }
      
      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error("Credenciales inválidas");
      }
      
      const token = generateToken({
        id_usuario: user.id_usuario,
        nombre_usuario: user.nombre_usuario,
        email: user.email,
      });
      
      return {
        token,
        user: {
          id_usuario: user.id_usuario,
          nombre_usuario: user.nombre_usuario,
          email: user.email,
        },
      };
    } finally {
      conn.release();
    }
  },
};

module.exports = AuthService;