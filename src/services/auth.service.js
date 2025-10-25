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
   * @param {Object} clientData - Datos específicos del cliente a registrar
   * @param {string} userData.nombre_usuario - Nombre del usuario
   * @param {string} userData.email - Correo electrónico del usuario
   * @param {string} userData.password - Contraseña sin encriptar
   * @param {string} clientData.direccion - Dirección del cliente
   * @param {string} clientData.telefono - Teléfono del cliente
   * @param {string} clientData.nombre - Nombre del cliente
   * @param {string} clientData.apellido - Apellido del cliente
   * @param {string} clientData.dni - DNI del cliente
   * @param {Date} clientData.fecha_nacimiento - Fecha de nacimiento del cliente
   * @param {string} clienteData.numero_casa - Número de casa del cliente
   * @param {string} clienteData.piso - Piso del cliente
   * @param {string} clienteData.departamento - Departamento del cliente
   * @param {string} clienteData.referencia - Referencia del cliente
   * @param {string} clienteData.provincia - Provincia del cliente
   * @param {string} clienteData.pais - País del cliente
   * @param {string} clienteData.ciudad - Ciudad del cliente
   * @param {string} clienteData.codigo_postal - Código postal del cliente
   * @returns {Object} Datos del usuario registrado (sin contraseña)
   * @throws {Error} Si el correo ya está registrado
   */
  register: async ({ nombre_usuario, email, password, role = "cliente" , nombre, apellido, dni, fecha_nacimiento, 
    direccion, telefono, numero_casa, piso, departamento, referencia, 
    provincia, pais, ciudad, codigo_postal }) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Verificar si el correo ya existe en la base de datos
      const [userExists] = await conn.query(
        "SELECT id_usuario FROM usuarios WHERE email = ?",
        [email]
      );

      if (userExists.length > 0) {
        throw new Error("El correo electrónico ya está registrado");
      }

      // Encriptar la contraseña antes de almacenarla
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar el nuevo usuario en la base de datos (tabla `usuarios`)
      const [result] = await conn.query(
        "INSERT INTO usuarios (nombre_usuario, email, password_hash, rol, estado) VALUES (?, ?, ?, ?, 'activo')",
        [nombre_usuario, email, hashedPassword, role]
      );

      const userId = result.insertId;

      // Si el rol es cliente, crear entrada en tabla clientes
      if (role === 'cliente') {
        await conn.query(
          "INSERT INTO clientes (id_usuario, fecha_registro, direccion, telefono, nombre, apellido, dni, fecha_nacimiento, numero_casa, piso, departamento, referencia, provincia, pais, ciudad, codigo_postal) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [userId, direccion, telefono, nombre, apellido, dni, fecha_nacimiento, numero_casa, piso, departamento, referencia, provincia, pais, ciudad, codigo_postal]
        );
      }

      await conn.commit();

      return {
        id_usuario: result.insertId,
        nombre_usuario,
        email,
        rol: role,
        estado: "activo",
      };
    }catch(error){
      await conn.rollback();
      throw error;
    } finally {
      conn.release(); // Liberar la conexión al pool
    }
  },

  //  Autentica a un usuario y genera un token JWT

  login: async ({ email, nombre_usuario, password }) => {
    const conn = await pool.getConnection();
    try {
      let query =
        "SELECT * FROM usuarios WHERE email = ? OR nombre_usuario = ?";
      const [users] = await conn.query(query, [email, nombre_usuario]);

      if (users.length === 0) {
        throw new Error("Credenciales inválidas");
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        throw new Error("Credenciales inválidas");
      }

      if (user.estado !== "activo") {
        throw new Error("Usuario inhabilitado");
      }

      const token = generateToken({
        id_usuario: user.id_usuario,
        nombre_usuario: user.nombre_usuario,
        email: user.email,
        rol: user.rol,
        estado: user.estado,
      });

      return {
        token,
        user: {
          id_usuario: user.id_usuario,
          nombre_usuario: user.nombre_usuario,
          email: user.email,
          rol: user.rol,
          estado: user.estado,
        },
      };
    } finally {
      conn.release();
    }
  },
};

module.exports = AuthService;
