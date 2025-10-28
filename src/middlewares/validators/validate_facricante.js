const Joi = require('joi');
// Validación para crear un fabricante
const fabricanteCreateSchema = Joi.object({
  nombre: Joi.string().min(2).max(120).required(),
  pais_origen: Joi.string().max(100).allow(null, ''),
  sitio_web: Joi.string().uri().allow(null, '')
});
// Validación para actualizar un fabricante
const fabricanteUpdateSchema = Joi.object({
  nombre: Joi.string().min(2).max(120).optional(),
  pais_origen: Joi.string().max(100).allow(null, '').optional(),
  sitio_web: Joi.string().uri().allow(null, '').optional()  
});
module.exports = { fabricanteCreateSchema, fabricanteUpdateSchema };
