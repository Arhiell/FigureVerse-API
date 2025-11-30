const { onRequest } = require('firebase-functions/v2/https');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

 const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.nombre_categoria
       FROM productos p
       INNER JOIN categorias c ON p.id_categoria = c.id_categoria
       WHERE p.estado = 'activo'
       ORDER BY p.id_producto DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /api/productos failed:', e);
    res.status(500).json({ error: 'Error obteniendo productos', detail: e.message });
  }
});

app.get('/api/resenas/producto/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT r.id_resena, r.calificacion, r.comentario, r.fecharesena,
              u.nombre_usuario
       FROM resenas r
       JOIN usuarios u ON r.id_usuario = u.id_usuario
       WHERE r.id_producto = ?
       ORDER BY r.fecharesena DESC`,
      [id]
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /api/resenas/producto/:id failed:', e);
    res.status(500).json({ error: 'Error obteniendo reseñas del producto', detail: e.message });
  }
});


app.get('/api/resenas', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.id_resena, r.id_producto, p.nombre AS producto,
              r.id_usuario, u.nombre_usuario, r.calificacion,
              r.comentario, r.fecharesena, r.estado
       FROM resenas r
       JOIN usuarios u ON r.id_usuario = u.id_usuario
       JOIN productos p ON r.id_producto = p.id_producto
       WHERE r.estado = 'aprobada'
       ORDER BY r.fecharesena DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /api/resenas failed:', e);
    res.status(500).json({ error: 'Error obteniendo reseñas', detail: e.message });
  }
});

// https://us-central1-figureverse-9b12e.cloudfunctions.net/api/... productos
// https://us-central1-figureverse-9b12e.cloudfunctions.net/api/... resenas
// https://us-central1-figureverse-9b12e.cloudfunctions.net/api/... resenas/producto/:id
exports.api = onRequest(app);
