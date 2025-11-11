/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Operaciones relacionadas con la gestión de usuarios (cliente, admin, superadmin)
 */

const express = require("express");
const router = express.Router();
const { authJwt } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/roleMiddleware");
const UserService = require("../services/user.service");
const ClientService = require("../services/client.service");
const OTPService = require("../services/otp.service");
const bcrypt = require("bcryptjs");
const validator = require("../middlewares/validators/validator");
const { profileUpdateSchema, changePasswordSchema } = require("../middlewares/validators/validate_user");

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
  *             examples:
  *               ejemplo:
  *                 summary: Respuesta de usuario básico
  *                 value:
  *                   ok: true
  *                   data:
  *                     id_usuario: 12
  *                     nombre_usuario: "Arielo"
  *                     email: "arielo@figureverse.com"
  *                     rol: "cliente"
  *                     estado: "activo"
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
  *           examples:
  *             activar:
  *               summary: Activar usuario
  *               value:
  *                 estado: "activo"
  *             inhabilitar:
  *               summary: Inhabilitar usuario
  *               value:
  *                 estado: "inhabilitado"
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

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener datos del usuario autenticado y su perfil de cliente (si existe)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado
 *         content:
 *           application/json:
 *             examples:
 *               ejemplo:
 *                 summary: Usuario con rol cliente y perfil creado
 *                 value:
 *                   ok: true
 *                   data:
 *                     user:
 *                       id_usuario: 12
 *                       nombre_usuario: "Arielo"
 *                       email: "arielo@figureverse.com"
 *                       rol: "cliente"
 *                       estado: "activo"
 *                     cliente:
 *                       nombre: "Ariel"
 *                       apellido: "Domínguez"
 *                       direccion: "Av. Siempre Viva 742"
 *                       ciudad: "Posadas"
 *                       provincia: "Misiones"
 *                       codigo_postal: "3300"
 *       401:
 *         description: Token inválido o no enviado
 */
router.get("/me", async (req, res, next) => {
  try {
    const id = req.user?.id_usuario;
    const user = await UserService.getById(id);
    if (!user) return res.status(404).json({ ok: false, error: "Usuario no encontrado" });
    const cliente = await ClientService.getByUserId(id);
    const { id_usuario, nombre_usuario, email, rol, estado } = user;
    res.status(200).json({ ok: true, data: { user: { id_usuario, nombre_usuario, email, rol, estado }, cliente } });
  } catch (err) {
    next(err);
  }
});

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

/**
 * @swagger
 * /users/me/profile:
 *   put:
 *     summary: Crea o actualiza el perfil de cliente del usuario autenticado (UPSERT)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           examples:
 *             actualizar_direccion:
 *               value:
 *                 direccion: "Av. Siempre Viva 123"
 *                 ciudad: "Posadas"
 *                 provincia: "Misiones"
 *                 codigo_postal: "3300"
 *     responses:
 *       200:
 *         description: Perfil de cliente actualizado/creado correctamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Requiere rol cliente
 */
router.put(
  "/me/profile",
  checkRole("cliente"),
  validator(profileUpdateSchema),
  async (req, res, next) => {
    try {
      const id = req.user?.id_usuario;
      // Actualiza de forma parcial; si el perfil no existe, exige campos mínimos.
      const updated = await ClientService.upsertByUserId(id, req.body);
      res.status(200).json({ ok: true, data: updated });
    } catch (err) {
      // Responder 400 si faltan campos mínimos en la primera creación
      if (err && err.code === "MISSING_REQUIRED") {
        return res.status(400).json({ ok: false, error: err.message, missing: err.missing || [] });
      }
      next(err);
    }
  }
);

/**
 * @swagger
 * /users/me/password:
 *   put:
 *     summary: Cambia la contraseña del usuario autenticado con verificación de dos pasos (OTP)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *               - otp_code
 *             properties:
 *               current_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *               otp_code:
 *                 type: string
 *           examples:
 *             ejemplo:
 *               value:
 *                 current_password: "12345678"
 *                 new_password: "Nuev4Seguridad!"
 *                 otp_code: "123456"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales u OTP inválidos
 */
router.put(
  "/me/password",
  validator(changePasswordSchema),
  async (req, res, next) => {
    try {
      const id = req.user?.id_usuario;
      const { current_password, new_password, otp_code } = req.body;
      const user = await UserService.getById(id);
      if (!user) return res.status(404).json({ ok: false, error: "Usuario no encontrado" });

      const isValid = await bcrypt.compare(current_password, user.password_hash);
      if (!isValid) return res.status(401).json({ ok: false, error: "Contraseña actual inválida" });

      const otpOk = await OTPService.verify(id, "password_change", otp_code);
      if (!otpOk) return res.status(401).json({ ok: false, error: "OTP inválido o no configurado" });

      const hash = await bcrypt.hash(new_password, 10);
      const db = require("../config/db");
      const conn = await db.getConnection();
      try {
        await conn.query("UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?", [hash, id]);
      } finally {
        conn.release();
      }

      res.status(200).json({ ok: true, message: "Contraseña actualizada correctamente" });
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
