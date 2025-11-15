const Joi = require("joi");

/* Schemas individuales */
const registerSchema = Joi.object({
  nombre_usuario: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().max(150).required(),
  password: Joi.string().min(8).max(128).required(),
  avatar_url: Joi.string().uri().optional(),
  role: Joi.string().valid("cliente", "admin", "superadmin").default("cliente"),
  fecha_nacimiento: Joi.date().less("2010-01-01").optional(),

  // Cliente plano (sin objeto)
  nombre: Joi.string().max(100).optional(),
  apellido: Joi.string().max(100).optional(),
  telefono: Joi.string().max(25).optional(),
  dni: Joi.string().max(20).optional(),
  direccion: Joi.string().max(255).optional(),
  numero: Joi.string().max(10).optional(),
  piso: Joi.string().max(10).optional(),
  departamento: Joi.string().max(10).optional(),
  referencia: Joi.string().max(255).optional(),
  provincia: Joi.string().max(100).optional(),
  pais: Joi.string().max(100).optional(),
  ciudad: Joi.string().max(100).optional(),
  codigo_postal: Joi.string().max(20).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().max(150).optional(),
  nombre_usuario: Joi.string().min(3).max(100).optional(),
  password: Joi.string().min(6).max(128).required().messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres.",
  }),
})
  .or("email", "nombre_usuario")
  .messages({
    "object.missing":
      "Debe proporcionar nombre de usuario o email, y contraseña.",
  });

const updateSchema = Joi.object({
  nombre_usuario: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().max(150).optional(),
  avatar_url: Joi.string().uri().optional(),
  estado: Joi.string().valid("activo", "inactivo").optional(),
});

const profileUpdateSchema = Joi.object({
  nombre: Joi.string().max(100).optional(),
  apellido: Joi.string().max(100).optional(),
  telefono: Joi.string().max(25).optional(),
  dni: Joi.string().max(20).optional(),
  direccion: Joi.string().max(255).optional(),
  numero: Joi.string().max(10).optional(),
  piso: Joi.string().max(10).optional(),
  departamento: Joi.string().max(10).optional(),
  referencia: Joi.string().max(255).optional(),
  provincia: Joi.string().max(100).optional(),
  pais: Joi.string().max(100).optional(),
  ciudad: Joi.string().max(100).optional(),
  codigo_postal: Joi.string().max(20).optional(),
  fecha_nacimiento: Joi.date().less("2010-01-01").optional(),
  preferencias: Joi.string().optional(),
}).min(1);

const changePasswordSchema = Joi.object({
  current_password: Joi.string().min(8).max(128).required(),
  new_password: Joi.string().min(8).max(128).required(),
  otp_code: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
});

const requestOtpSchema = Joi.object({
  purpose: Joi.string().valid("password_change").default("password_change"),
  delivery: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  new_password: Joi.string().min(8).max(128).required(),
  otp_code: Joi.string().length(6).pattern(/^[0-9]+$/).optional(),
});

/* Exports */
module.exports = {
  registerSchema,
  loginSchema,
  updateSchema,
  profileUpdateSchema,
  changePasswordSchema,
  requestOtpSchema,
  resetPasswordSchema,
};