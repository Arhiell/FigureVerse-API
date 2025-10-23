const Joi = require('joi');

// Esquema de validación para el registro de usuarios
const registerSchema = Joi.object({
nombre_usuario: Joi.string().min(3).max(100).required(), 
email: Joi.string().email().max(150).required(), 
password: Joi.string().min(8).max(128).required().messages({
'string.min': 'La contraseña debe tener al menos 8 caracteres.'
}),
avatar_url: Joi.string().uri().optional()
});

// Esquema de validación para el inicio de sesión
const loginSchema = Joi.object({
nombre_usuario: Joi.string().min(3).max(100).required(),
password: Joi.string().required()
});


const updateSchema = Joi.object({
nombre_usuario: Joi.string().min(3).max(100).optional(),
email: Joi.string().email().max(150).optional(),
avatar_url: Joi.string().uri().optional(),
estado: Joi.string().valid('activo','inactivo').optional()
});


module.exports = {
registerSchema,
loginSchema,
updateSchema
};

