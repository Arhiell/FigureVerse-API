/**
 * Módulo de autenticación JWT
 * Proporciona middleware para validar tokens JWT
 */
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware para validar tokens JWT
 * Verifica que el token proporcionado en el header sea válido
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const authJwt = (req, res, next) => {
  try {
    // Obtener el header de autorización
    const header = req.headers["authorization"];
    if (!header) return res.status(401).json({ error: "Token no proporcionado" });

    // Extraer y verificar el token
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Añadir información del usuario al objeto request
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido o expirado" });
  }
};

module.exports = { authJwt };