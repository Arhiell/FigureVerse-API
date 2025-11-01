// user.model.js
const pool = require('config/db'); 

// modelo de usuario
const UserModel = {
async create(user) {
const sql = `INSERT INTO usuarios (nombre_usuario, email, password_hash, rol, estado, avatar_url)
VALUES (?, ?, ?, ?, ?, ?)`;
const params = [user.nombre_usuario, user.email, user.password_hash, user.rol || 'cliente', user.estado || 'activo', user.avatar_url || null];
const [result] = await pool.execute(sql, params);
return { id: result.insertId, ...user };
},

// Buscar usuario por email
async findByEmail(email) {
const sql = `SELECT * FROM usuarios WHERE email = ? LIMIT 1`;
const [rows] = await pool.execute(sql, [email]);
return rows[0] || null;
},

// Buscar usuario por nombre de usuario
async findByUsername(nombre_usuario) {
const sql = `SELECT * FROM usuarios WHERE nombre_usuario = ? LIMIT 1`;
const [rows] = await pool.execute(sql, [nombre_usuario]);
return rows[0] || null;
},

// Buscar usuario por ID
async findById(id_usuario) {
const sql = `SELECT * FROM usuarios WHERE id_usuario = ? LIMIT 1`;
const [rows] = await pool.execute(sql, [id_usuario]);
return rows[0] || null;
},

// Actualizar el último login del usuario
async updateLastLogin(id_usuario) {
const sql = `UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = ?`;
await pool.execute(sql, [id_usuario]);
return true;
},

// Actualizar estado de verificación del usuario
async updateVerificationState(id_usuario, newStateObj) {
// newStateObj puede contener campos como 'email_verificado', 'token_verificacion'
const sets = [];
const params = [];
for (const k in newStateObj) {
sets.push(`${k} = ?`);
params.push(newStateObj[k]);
}
params.push(id_usuario);
const sql = `UPDATE usuarios SET ${sets.join(', ')} WHERE id_usuario = ?`;
await pool.execute(sql, params);
return true;
},

// Actualizar contraseña del usuario
async updatePassword(id_usuario, password_hash) {
const sql = `UPDATE usuarios SET password_hash = ?, updated_at = NOW() WHERE id_usuario = ?`;
await pool.execute(sql, [password_hash, id_usuario]);
return true;
}
};


module.exports = UserModel;