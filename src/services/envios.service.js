// SERVICIO DE ENVÍOS: lógica de BD y funciones reutilizables
const pool = require("../config/db");

const EnviosService = {
  // Crear un envío nuevo asociado a un pedido
  // Usado por: POST /envios (admin/sistema) y HOOK de pagos aprobados
  crearEnvio: async (payload) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Validar que el pedido exista
      const [pedidoRows] = await conn.query(
        "SELECT id_pedido, id_usuario FROM pedidos WHERE id_pedido = ?",
        [payload.id_pedido]
      );
      if (!pedidoRows.length) {
        throw new Error("Pedido no encontrado para crear el envío");
      }

      // Verificar que no exista ya un envío para el pedido (1:1)
      const [envioExistente] = await conn.query(
        "SELECT id_envio FROM envios WHERE id_pedido = ?",
        [payload.id_pedido]
      );
      if (envioExistente.length) {
        throw new Error("Ya existe un envío para este pedido");
      }

      const {
        id_pedido,
        destinatario = null,
        direccion_envio = null,
        ciudad = null,
        provincia = null,
        pais = "Argentina",
        codigo_postal = null,
        empresa_envio = null,
        numero_seguimiento = null,
        estado_envio = "preparando",
        fecha_envio = null,
        fecha_entrega = null,
      } = payload;

      const [result] = await conn.query(
        `INSERT INTO envios
        (id_pedido, destinatario, direccion_envio, ciudad, provincia, pais, codigo_postal,
         empresa_envio, numero_seguimiento, estado_envio, fecha_envio, fecha_entrega)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_pedido,
          destinatario,
          direccion_envio,
          ciudad,
          provincia,
          pais,
          codigo_postal,
          empresa_envio,
          numero_seguimiento,
          estado_envio,
          fecha_envio,
          fecha_entrega,
        ]
      );

      await conn.commit();
      return { id_envio: result.insertId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // Listar envíos
  // - Admin/Super: todos
  // - Cliente: solo suyos (por join con pedidos.id_usuario)
  listarEnvios: async ({ rol, id_usuario }) => {
    if (rol === "cliente") {
      const [rows] = await pool.query(
        `SELECT e.*
         FROM envios e
         INNER JOIN pedidos p ON p.id_pedido = e.id_pedido
         WHERE p.id_usuario = ?
         ORDER BY e.id_envio DESC`,
        [id_usuario]
      );
      return rows;
    }
    // admin / super_admin
    const [rows] = await pool.query(
      "SELECT * FROM envios ORDER BY id_envio DESC"
    );
    return rows;
  },

  // Obtener un envío por ID (con control de acceso según rol)
  obtenerEnvio: async ({ id_envio, rol, id_usuario }) => {
    if (rol === "cliente") {
      const [rows] = await pool.query(
        `SELECT e.*
         FROM envios e
         INNER JOIN pedidos p ON p.id_pedido = e.id_pedido
         WHERE e.id_envio = ? AND p.id_usuario = ?`,
        [id_envio, id_usuario]
      );
      if (!rows.length) throw new Error("Envío no encontrado o no autorizado");
      return rows[0];
    }
    // admin/super_admin
    const [rows] = await pool.query("SELECT * FROM envios WHERE id_envio = ?", [
      id_envio,
    ]);
    if (!rows.length) throw new Error("Envío no encontrado");
    return rows[0];
  },

  // Actualizar envío (solo admin/super)
  actualizarEnvio: async ({ id_envio, data }) => {
    // Construcción dinámica de UPDATE para solo campos provistos
    const campos = [];
    const valores = [];
    const permitidos = [
      "destinatario",
      "direccion_envio",
      "ciudad",
      "provincia",
      "pais",
      "codigo_postal",
      "empresa_envio",
      "numero_seguimiento",
      "estado_envio",
      "fecha_envio",
      "fecha_entrega",
    ];

    for (const key of permitidos) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        campos.push(`${key} = ?`);
        valores.push(data[key]);
      }
    }

    if (!campos.length) {
      throw new Error("No hay campos válidos para actualizar");
    }

    valores.push(id_envio);

    const [result] = await pool.query(
      `UPDATE envios SET ${campos.join(", ")} WHERE id_envio = ?`,
      valores
    );
    if (result.affectedRows === 0) throw new Error("Envío no encontrado");
    return { id_envio };
  },
};

module.exports = EnviosService;
