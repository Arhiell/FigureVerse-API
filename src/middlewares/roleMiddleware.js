/**
 * Middleware de autorización por roles
 * Verifica que el usuario autenticado tenga uno de los roles permitidos
 */

const checkRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    try {
      // Log interno para depuración (ahora sí, dentro del middleware)
      console.log("Rol del usuario:", req.user?.rol);
      console.log("Roles permitidos:", rolesPermitidos);

      const rolUsuario = req.user?.rol || req.user?.role;
      if (!rolUsuario) {
        return res.status(403).json({ error: "Rol no presente en el token" });
      }

      if (!rolesPermitidos.includes(rolUsuario)) {
        return res
          .status(403)
          .json({ error: "Permisos insuficientes para el recurso" });
      }

      next();
    } catch (err) {
      console.error("Error en verificación de rol:", err.message);
      return res.status(500).json({ error: "Error en verificación de rol" });
    }
  };
};

module.exports = { checkRole };
