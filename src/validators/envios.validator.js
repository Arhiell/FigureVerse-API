// VALIDACIONES JOI PARA EL MÓDULO DE ENVÍOS
const Joi = require("joi");

// Estados válidos según la tabla `envios`
const ESTADOS_ENVIO = ["preparando", "en_camino", "entregado", "devuelto"];

// Schema para crear envío (cuando pago aprobado)
// Nota: id_pedido es requerido. Otros campos opcionales se pueden completar luego.
const createEnvioSchema = Joi.object({
  id_pedido: Joi.number().integer().required(),
  destinatario: Joi.string().max(200).allow(null, ""),
  direccion_envio: Joi.string().max(255).allow(null, ""),
  ciudad: Joi.string().max(100).allow(null, ""),
  provincia: Joi.string().max(100).allow(null, ""),
  pais: Joi.string().max(100).default("Argentina"),
  codigo_postal: Joi.string().max(20).allow(null, ""),
  empresa_envio: Joi.string().max(120).allow(null, ""),
  numero_seguimiento: Joi.string().max(120).allow(null, ""),
  estado_envio: Joi.string()
    .valid(...ESTADOS_ENVIO)
    .default("preparando"),
  fecha_envio: Joi.date().allow(null),
  fecha_entrega: Joi.date().allow(null),
});

// Schema para actualizar envío (admin/super)
const updateEnvioSchema = Joi.object({
  destinatario: Joi.string().max(200).optional(),
  direccion_envio: Joi.string().max(255).optional(),
  ciudad: Joi.string().max(100).optional(),
  provincia: Joi.string().max(100).optional(),
  pais: Joi.string().max(100).optional(),
  codigo_postal: Joi.string().max(20).optional(),
  empresa_envio: Joi.string().max(120).optional(),
  numero_seguimiento: Joi.string().max(120).optional(),
  estado_envio: Joi.string()
    .valid(...ESTADOS_ENVIO)
    .optional(),
  fecha_envio: Joi.date().optional(),
  fecha_entrega: Joi.date().optional(),
}).min(1); // al menos un campo

module.exports = { createEnvioSchema, updateEnvioSchema, ESTADOS_ENVIO };
