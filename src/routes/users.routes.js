/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Operaciones relacionadas con la gestión de usuarios (cliente, admin, superadmin)
 */

const express = require("express");
const router = express.Router();
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roles.middleware");
const UserService = require("../services/user.service");

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener datos de un usuario específico
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a consultar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del usuario obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_usuario:
 *                       type: integer
 *                     nombre_usuario:
 *                       type: string
 *                     email:
 *                       type: string
 *                     rol:
 *                       type: string
 *                     estado:
 *                       type: string
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Cambiar estado de un usuario (solo admin o superadmin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario cuyo estado se actualizará
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [activo, inhabilitado]
 *                 example: activo
 *     responses:
 *       200:
 *         description: Estado del usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Parámetros inválidos
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */

// Middleware global de autenticación
router.use(authJwt);

//Obtener datos de un usuario específico
router.get(
  "/:id",
  checkRole("admin", "super_admin"),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (!id) {
        return res.status(400).json({ ok: false, error: "ID inválido" });
      }

      const user = await UserService.getById(id);

      if (!user) {
        return res
          .status(404)
          .json({ ok: false, error: "Usuario no encontrado" });
      }

      // Devuelve solo datos públicos
      const { id_usuario, nombre_usuario, email, rol, estado } = user;
      res.status(200).json({
        ok: true,
        data: { id_usuario, nombre_usuario, email, rol, estado },
      });
    } catch (err) {
      next(err);
    }
  }
);
//Cambiar estado de usuario (admin/superadmin)
router.patch(
  "/:id/status",
  checkRole("admin", "superadmin", "super_admin"),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { estado } = req.body;

      // Validación simple de entrada
      if (!id || !estado || !["activo", "inactivo"].includes(estado)) {
        return res
          .status(400)
          .json({ ok: false, error: "Parámetros inválidos" });
      }

      await UserService.updateStatus(id, estado);
      res
        .status(200)
        .json({ ok: true, message: "Estado actualizado correctamente" });
    } catch (err) {
      next(err); // delega al error handler global
    }
  }
);

module.exports = router;
