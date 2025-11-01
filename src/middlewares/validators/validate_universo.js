const Joi = require('joi');

// Validación para crear un universo
const createUniversoSchema = Joi.object({
    nombre_universo: Joi.string().min(3).max(120).required(),
    descripcion: Joi.string().max(300).allow(null, '').optional()
});

// Validación para actualizar un universo
const updateUniversoSchema = Joi.object({
    nombre_universo: Joi.string().min(3).max(120).optional(),
    descripcion: Joi.string().max(300).allow(null, '').optional()
});

module.exports = { createUniversoSchema, updateUniversoSchema };
