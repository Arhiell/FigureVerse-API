const DescuentosService = require("../services/descuentos.service");
const {
  createDescuentoSchema,
  updateDescuentoSchema,
} = require("../middlewares/validators/descuentos.validator");

const DescuentosController = {
  crear: async (req, res, next) => {
    try {
      const { error, value } = createDescuentoSchema.validate(req.body);
      if (error) throw new Error(error.message);
      const nuevo = await DescuentosService.crearDescuento(value);
      res.status(201).json({
        ok: true,
        message: "Descuento creado exitosamente",
        data: nuevo,
      });
    } catch (err) {
      next(err);
    }
  },

  listar: async (req, res, next) => {
    try {
      const data = await DescuentosService.listarDescuentos();
      res.json({ ok: true, data });
    } catch (err) {
      next(err);
    }
  },

  obtenerPorCodigo: async (req, res, next) => {
    try {
      const data = await DescuentosService.obtenerPorCodigo(req.params.codigo);
      if (!data)
        return res
          .status(404)
          .json({ ok: false, message: "Descuento no encontrado" });
      res.json({ ok: true, data });
    } catch (err) {
      next(err);
    }
  },

  actualizar: async (req, res, next) => {
    try {
      const { error, value } = updateDescuentoSchema.validate(req.body);
      if (error) throw new Error(error.message);
      const actualizado = await DescuentosService.actualizarDescuento(
        req.params.id,
        value
      );
      if (!actualizado)
        return res
          .status(404)
          .json({ ok: false, message: "Descuento no encontrado" });
      res.json({
        ok: true,
        message: "Descuento actualizado",
        data: actualizado,
      });
    } catch (err) {
      next(err);
    }
  },

  eliminar: async (req, res, next) => {
    try {
      const eliminado = await DescuentosService.eliminarDescuento(
        req.params.id
      );
      res.json({ ok: true, message: "Descuento desactivado", data: eliminado });
    } catch (err) {
      next(err);
    }
  },

  aplicarADescuento: async (req, res, next) => {
    try {
      const { codigo } = req.body;
      const data = await DescuentosService.aplicarDescuentoAPedido(
        req.params.id,
        codigo
      );
      res.json({ ok: true, message: "Descuento aplicado exitosamente", data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = DescuentosController;
