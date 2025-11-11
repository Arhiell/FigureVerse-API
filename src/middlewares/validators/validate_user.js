const Joi = require("joi");

const registerSchema = Joi.object({
  nombre_usuario: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().max(150).required(),
  password: Joi.string().min(8).max(128).required(),
  avatar_url: Joi.string().uri().optional(),
  role: Joi.string().valid("cliente", "admin", "superadmin").default("cliente"),
<<<<<<< HEAD
  clienteData: Joi.object({
    nombre: Joi.string().max(100).required(),
    apellido: Joi.string().max(100).required(),
    telefono: Joi.string().max(25).required(),
    dni: Joi.string().max(20).required(),
    direccion: Joi.string().max(255).required(),
    numero: Joi.string().max(10).optional(),
    piso: Joi.string().max(10).optional(),
    departamento: Joi.string().max(10).optional(),
    referencia: Joi.string().max(255).optional(),
    provincia: Joi.string().max(100).required(),
    pais: Joi.string().max(100).required(),
    ciudad: Joi.string().max(100).required(),
    codigo_postal: Joi.string().max(20).required(),
    fecha_nacimiento: Joi.date().less("1/01/2010").optional(),
  }),
=======
  fecha_nacimiento: Joi.date().less("1/01/2010").optional(),

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
>>>>>>> ec3d53dcd7ae846eddcc04c3c7c90551daad0a9c
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
  profileUpdateSchema: Joi.object({
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
    fecha_nacimiento: Joi.date().less("1/01/2010").optional(),
    preferencias: Joi.string().optional(),
  }).min(1),
  changePasswordSchema: Joi.object({
    current_password: Joi.string().min(8).max(128).required(),
    new_password: Joi.string().min(8).max(128).required(),
    otp_code: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  }),
  requestOtpSchema: Joi.object({
    purpose: Joi.string().valid("password_change").default("password_change"),
    delivery: Joi.string().valid("email").default("email"),
  }),
  resetPasswordSchema: Joi.object({
    token: Joi.string().required(),
    new_password: Joi.string().min(8).max(128).required(),
    otp_code: Joi.string().length(6).pattern(/^[0-9]+$/).optional(),
  }),
};
