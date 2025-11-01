const Joi = require('joi');

// Validación para crear o actualizar una variante
const varianteSchema = Joi.object({
  id_producto: Joi.number().integer().positive().required(),
  atributo: Joi.string().max(80).required(),
  valor: Joi.string().max(120).required(),
  precio: Joi.number().precision(2).min(0).allow(null),
  stock: Joi.number().integer().min(0).default(0),
  sku: Joi.string().max(60).allow(null, '')
});

module.exports = { varianteSchema };
