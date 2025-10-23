/**
 * Middleware para manejar errores en la aplicación
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  
  console.error(`Error: ${message}`);
  console.error(err.stack);
  
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};

module.exports = { errorHandler };