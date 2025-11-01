/**
 * Middleware de validación
 * Utiliza los esquemas de Joi para validar los datos de las solicitudes
 */

/**
 * Crea un middleware de validación para un esquema específico
 * @param {Object} schema - Esquema de Joi para validar
 * @param {String} property - Propiedad de la solicitud a validar (body, params, query)
 * @returns {Function} Middleware de Express
 */
const validator = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (!error) {
      next();
    } else {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      res.status(400).json({
        ok: false,
        errors
      });
    }
  };
};

module.exports = validator;