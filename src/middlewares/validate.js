const Joi = require("joi");

// Esquema de validación: Registro
const registerSchema = Joi.object({
  nombre_usuario: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().max(150).required(),
  password: Joi.string().min(8).max(128).required().messages({
    "string.min": "La contraseña debe tener al menos 8 caracteres.",
  }),
  avatar_url: Joi.string().uri().optional(),
});

// Esquema de validación: Login (Permite login con nombre_usuario o email)

const loginSchema = Joi.object({
  email: Joi.string().email().max(150).optional(),
  nombre_usuario: Joi.string().min(3).max(100).optional(),
  password: Joi.string().min(6).max(128).required().messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres.",
  }),
})
  // Esta línea permite usar UNO u OTRO
  .or("email", "nombre_usuario")
  .messages({
    "object.missing":
      "Debe proporcionar nombre de usuario o email, y contraseña.",
  });

// Esquema de validación: Actualización de usuario

const updateSchema = Joi.object({
  nombre_usuario: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().max(150).optional(),
  avatar_url: Joi.string().uri().optional(),
  estado: Joi.string().valid("activo", "inactivo").optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateSchema,
};
