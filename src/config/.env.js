/**
 * Configuración de variables de entorno
 * Este módulo carga y estructura las variables de entorno para su uso en la aplicación
 */
require("dotenv").config();

/**
 * Objeto de configuración que contiene todas las variables de entorno
 * organizadas por categorías para facilitar su acceso
 */
const env = {
  // Configuración del entorno de Node.js
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  
  // Configuración de la base de datos MySQL
  DB: {
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT,
    USER: process.env.DB_USER,
    PASS: process.env.DB_PASS,
    NAME: process.env.DB_NAME
  },
  
  // Configuración de JWT para autenticación
  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN
  },
  
  // Configuración del servidor SMTP para envío de correos
  EMAIL: {
    HOST: process.env.EMAIL_HOST,
    PORT: process.env.EMAIL_PORT,
    USER: process.env.EMAIL_USER,
    PASS: process.env.EMAIL_PASS
  },
  
  // Configuración de CORS para acceso desde el frontend
  CORS_ORIGIN: process.env.CORS_ORIGIN
};

module.exports = env;