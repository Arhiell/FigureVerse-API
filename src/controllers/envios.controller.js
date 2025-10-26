// CONTROLADOR DE ENVÍOS: orquesta servicios y respuestas
const EnviosService = require("../services/envios.service");

const EnviosController = {
  // POST /envios (admin o sistema)
  crearEnvio: async (req, res, next) => {
    try {
      // Si viene del sistema/servicio de pagos, el body trae id_pedido y opcionales
      const envio = await EnviosService.crearEnvio(req.body);
      res.status(201).json({ ok: true, data: envio });
    } catch (err) {
      next(err);
    }
  },

  // GET /envios
  listarEnvios: async (req, res, next) => {
    try {
      const { rol, id_usuario } = req.user;
      const envios = await EnviosService.listarEnvios({ rol, id_usuario });
      res.json({ ok: true, data: envios });
    } catch (err) {
      next(err);
    }
  },

  // GET /envios/:id
  obtenerEnvio: async (req, res, next) => {
    try {
      const { rol, id_usuario } = req.user;
      const id_envio = parseInt(req.params.id, 10);
      const envio = await EnviosService.obtenerEnvio({
        id_envio,
        rol,
        id_usuario,
      });
      res.json({ ok: true, data: envio });
    } catch (err) {
      next(err);
    }
  },

  // PUT /envios/:id (admin/super)
  actualizarEnvio: async (req, res, next) => {
    try {
      const id_envio = parseInt(req.params.id, 10);
      const result = await EnviosService.actualizarEnvio({
        id_envio,
        data: req.body,
      });
      res.json({
        ok: true,
        message: "Envío actualizado correctamente",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = EnviosController;
