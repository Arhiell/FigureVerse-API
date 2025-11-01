const Joi = require('joi');

// Esquema de validación para imágenes
const imagenSchema = Joi.object({
  id_producto: Joi.number().integer().positive().required(),
  id_variante: Joi.number().integer().positive().allow(null),
  url_imagen: Joi.string().uri().required(),
  posicion: Joi.number().integer().min(1).default(1),
  alt_text: Joi.string().max(200).allow(null, '')
});

module.exports = { imagenSchema };