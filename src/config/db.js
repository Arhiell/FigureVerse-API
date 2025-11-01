/**
 * Módulo de conexión a la base de datos MySQL
 * Configura y gestiona el pool de conexiones a la base de datos
 */
const mysql = require("mysql2/promise");
require("dotenv").config();

/**
 * Pool de conexiones MySQL
 * Permite la reutilización eficiente de conexiones a la base de datos
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,  // Máximo de conexiones simultáneas
  queueLimit: 0,        // Sin límite en la cola de conexiones
});

// Verificar la conexión al iniciar la aplicación
pool.getConnection()
  .then(conn => {
    console.log("Conexión MySQL establecida con FigureVerse");
    conn.release();
  })
  .catch(err => {
    console.error("Error al conectar con MySQL:", err.message);
  });

module.exports = pool;