const Joi = require("joi");

// Validar creación de un nuevo descuento
const createDescuentoSchema = Joi.object({
  codigo: Joi.string().alphanum().min(4).max(20).required(),
  descripcion: Joi.string().max(255).allow(null, ""),
  tipo: Joi.string().valid("porcentaje", "monto", "envio_gratis").required(),
  valor: Joi.number().min(0).required(),
  fecha_inicio: Joi.date().required(),
  fecha_fin: Joi.date().greater(Joi.ref("fecha_inicio")).required(),
  estado: Joi.string().valid("activo", "inactivo").default("activo"),
});

// Validar actualización parcial
const updateDescuentoSchema = Joi.object({
  descripcion: Joi.string().max(255).allow(null, ""),
  tipo: Joi.string().valid("porcentaje", "monto", "envio_gratis"),
  valor: Joi.number().min(0),
  fecha_inicio: Joi.date(),
  fecha_fin: Joi.date(),
  estado: Joi.string().valid("activo", "inactivo"),
}).min(1);

module.exports = { createDescuentoSchema, updateDescuentoSchema };
