// Validaciones con Joi para pedidos
const Joi = require("joi");

// Validar creación de pedido
const createOrderSchema = Joi.object({
  subtotal: Joi.number().precision(2).required(),
  descuento_total: Joi.number().precision(2).default(0.0),
  costo_envio: Joi.number().precision(2).default(0.0),
  total: Joi.number().precision(2).required(),
  metodo_entrega: Joi.string()
    .valid("retiro", "envio_domicilio")
    .default("envio_domicilio"),
  notas: Joi.string().allow("", null),
  detalles: Joi.array()
    .items(
      Joi.object({
        id_producto: Joi.number().integer().required(),
        id_variante: Joi.number().integer().allow(null),
        cantidad: Joi.number().integer().min(1).required(),
        precio_unitario: Joi.number().precision(2).required(),
        iva_porcentaje: Joi.number().precision(2).default(21.0),
        iva_monto: Joi.number().precision(2).default(0.0),
      })
    )
    .required(),
});

const updateOrderStatusSchema = Joi.object({
  estado_nuevo: Joi.string()
    .valid(
      "pendiente",
      "pagado",
      "enviado",
      "entregado",
      "cancelado",
      "reembolsado"
    )
    .required(),
  comentario: Joi.string().allow("", null),
});

module.exports = { createOrderSchema, updateOrderStatusSchema };
