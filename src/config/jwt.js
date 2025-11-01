/**
 * Módulo de gestión de tokens JWT
 * Proporciona funciones para generar y verificar tokens
 */
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Genera un token JWT con la información proporcionada
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Token JWT generado
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Verifica la validez de un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object} Payload decodificado del token
 * @throws {Error} Si el token es inválido o ha expirado
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };