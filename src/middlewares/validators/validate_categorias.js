const Joi = require('joi');

// Validación para crear una categoría
const createCategoriaSchema = Joi.object({
  nombre_categoria: Joi.string().min(3).max(120).required(),
  descripcion: Joi.string().max(300).allow(null, '').optional(),
  estado: Joi.string().valid('activo','inactivo').default('activo')
});

// Validación para actualizar una categoría
const updateCategoriaSchema = Joi.object({
  nombre_categoria: Joi.string().min(3).max(120).optional(),
  descripcion: Joi.string().max(300).allow(null, '').optional(),
  estado: Joi.string().valid('activo','inactivo').optional()
});

module.exports = { createCategoriaSchema, updateCategoriaSchema };
