const Joi = require('joi');

// Validación para crear un producto
const createProductoSchema = Joi.object({
  nombre: Joi.string().max(200).required(),
  descripcion: Joi.string().allow(null, '').optional(),
  precio_base: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).default(0),
  stock_minimo: Joi.number().integer().min(0).default(5),
  iva_porcentaje: Joi.number().min(0).max(100).default(21),
  id_categoria: Joi.number().integer().required(),
  id_universo: Joi.number().integer().allow(null).optional(),
  id_fabricante: Joi.number().integer().allow(null).optional(),
  anio_lanzamiento: Joi.number().integer().min(1900).max(new Date().getFullYear()).allow(null).optional(),
  escala: Joi.string().max(20).allow(null, '').optional(),
  estado: Joi.string().valid('activo','inactivo','edicion_limitada','agotado').default('activo')
});

// Validación para actualizar 
const updateProductoSchema = Joi.object({
  nombre: Joi.string().max(200).optional(),
  descripcion: Joi.string().allow(null, '').optional(),
  precio_base: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  stock_minimo: Joi.number().integer().min(0).optional(),
  iva_porcentaje: Joi.number().min(0).max(100).optional(),
  id_categoria: Joi.number().integer().optional(),
  id_universo: Joi.number().integer().allow(null).optional(),
  id_fabricante: Joi.number().integer().allow(null).optional(),
  anio_lanzamiento: Joi.number().integer().min(1900).max(new Date().getFullYear()).allow(null).optional(),
  escala: Joi.string().max(20).allow(null, '').optional(),
  estado: Joi.string().valid('activo','inactivo','edicion_limitada','agotado').optional()
});

module.exports = { createProductoSchema, updateProductoSchema };
