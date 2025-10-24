/**
 * Configuración de Passport para autenticación
 */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('./db');
const { generateToken } = require('./jwt');

// Configuración de la estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/auth/google/callback`,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Verificar si el usuario ya existe en la base de datos (tabla `usuario`)
      const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [profile.emails[0].value]);
      
      if (rows.length > 0) {
        const user = rows[0];
        const token = generateToken({
          id_usuario: user.id_usuario,
          nombre_usuario: user.nombre_usuario,
          email: user.email,
          rol: user.rol,
          estado: user.estado
        });
        return done(null, { user, token });
      } else {
        const randomPassword = await bcrypt.hash(String(Date.now()), 10);
        const [result] = await pool.query(
          'INSERT INTO usuarios (nombre_usuario, email, password_hash, rol, estado) VALUES (?, ?, ?, ?, \"activo\")',
          [profile.displayName, profile.emails[0].value, randomPassword, 'cliente']
        );
        
        const newUser = {
          id_usuario: result.insertId,
          nombre_usuario: profile.displayName,
          email: profile.emails[0].value,
          rol: 'cliente',
          estado: 'activo'
        };
        
        const token = generateToken({
          id_usuario: newUser.id_usuario,
          nombre_usuario: newUser.nombre_usuario,
          email: newUser.email,
          rol: newUser.rol,
          estado: newUser.estado
        });
        return done(null, { user: newUser, token });
      }
    } catch (error) {
      return done(error);
    }
  }
));

module.exports = passport;