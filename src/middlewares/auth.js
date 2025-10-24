const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el token JWT
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

/**
 * Middleware para verificar el rol del usuario
 * @param {string|string[]} roles - Rol o roles permitidos
 */
const normalizeRole = (r) => {
  if (!r) return r;
  const map = {
    super_admin: 'superadmin',
    superadmin: 'superadmin',
    admin: 'admin',
    cliente: 'cliente',
    user: 'cliente'
  };
  return map[r] || r;
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const userRole = normalizeRole(req.user.role || req.user.rol);
    const allowed = Array.isArray(roles) ? roles.map(normalizeRole) : [normalizeRole(roles)];
    
    if (!allowed.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Acceso prohibido - No tienes los permisos necesarios' 
      });
    }
    
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole
};