const Joi = require("joi");

// Validador para actualización parcial de configuración de empresa
const updateCompanySettingsSchema = Joi.object({
  from_name: Joi.string().max(100).optional(),
  from_email: Joi.string().email().max(255).optional(),
  telefono: Joi.string().max(25).optional(),
  direccion: Joi.string().max(255).optional(),
  numero: Joi.string().max(10).optional(),
  piso: Joi.string().max(10).optional(),
  departamento: Joi.string().max(10).optional(),
  ciudad: Joi.string().max(100).optional(),
  provincia: Joi.string().max(100).optional(),
  pais: Joi.string().max(100).optional(),
  codigo_postal: Joi.string().max(20).optional(),
  sitio_web: Joi.string().uri().max(255).optional(),
  instagram: Joi.string().max(255).optional(),
  facebook: Joi.string().max(255).optional(),
  twitter: Joi.string().max(255).optional(),
  tiktok: Joi.string().max(255).optional(),
  youtube: Joi.string().max(255).optional(),
  logo_url: Joi.string().uri().max(255).optional(),
}).min(1);

module.exports = { updateCompanySettingsSchema };