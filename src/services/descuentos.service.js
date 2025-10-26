const pool = require("../config/db");

const DescuentosService = {
  // Crear un nuevo descuento
  crearDescuento: async (data) => {
    const [result] = await pool.query(
      `INSERT INTO descuentos (codigo, descripcion, tipo, valor, fecha_inicio, fecha_fin, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.codigo,
        data.descripcion,
        data.tipo,
        data.valor,
        data.fecha_inicio,
        data.fecha_fin,
        data.estado || "activo",
      ]
    );
    return { id_descuento: result.insertId, ...data };
  },

  // Listar todos los descuentos
  listarDescuentos: async () => {
    const [rows] = await pool.query(
      `SELECT * FROM descuentos ORDER BY created_at DESC`
    );
    return rows;
  },

  // Obtener un descuento por código
  obtenerPorCodigo: async (codigo) => {
    const [rows] = await pool.query(
      `SELECT * FROM descuentos WHERE codigo = ?`,
      [codigo]
    );
    return rows[0];
  },

  // Actualizar un descuento
  actualizarDescuento: async (id, data) => {
    const campos = [];
    const valores = [];

    for (const [key, value] of Object.entries(data)) {
      campos.push(`${key} = ?`);
      valores.push(value);
    }

    valores.push(id);
    const [result] = await pool.query(
      `UPDATE descuentos SET ${campos.join(", ")} WHERE id_descuento = ?`,
      valores
    );

    return result.affectedRows ? { id_descuento: id, ...data } : null;
  },

  // Eliminar (o desactivar) descuento
  eliminarDescuento: async (id) => {
    await pool.query(
      `UPDATE descuentos SET estado = 'inactivo' WHERE id_descuento = ?`,
      [id]
    );
    return { id_descuento: id, estado: "inactivo" };
  },

  // Aplicar un descuento a un pedido
  aplicarDescuentoAPedido: async (id_pedido, codigo) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Buscar el descuento activo y vigente
      const [rows] = await conn.query(
        `SELECT * FROM descuentos 
         WHERE codigo = ? AND estado = 'activo' 
         AND NOW() BETWEEN fecha_inicio AND fecha_fin`,
        [codigo]
      );

      if (!rows.length)
        throw new Error("El código de descuento no es válido o está vencido");
      const descuento = rows[0];

      // Obtener total actual del pedido
      const [pedidoRows] = await conn.query(
        `SELECT total, costo_envio FROM pedidos WHERE id_pedido = ?`,
        [id_pedido]
      );
      if (!pedidoRows.length) throw new Error("Pedido no encontrado");
      const pedido = pedidoRows[0];

      // Calcular el monto a aplicar
      let monto_aplicado = 0;
      let nuevo_total = pedido.total;

      switch (descuento.tipo) {
        case "porcentaje":
          monto_aplicado = (pedido.total * descuento.valor) / 100;
          nuevo_total -= monto_aplicado;
          break;
        case "monto":
          monto_aplicado = descuento.valor;
          nuevo_total -= monto_aplicado;
          break;
        case "envio_gratis":
          monto_aplicado = pedido.costo_envio;
          nuevo_total -= pedido.costo_envio;
          break;
      }

      if (nuevo_total < 0) nuevo_total = 0;

      // Registrar relación en pedidos_descuentos
      await conn.query(
        `INSERT INTO pedidos_descuentos (id_pedido, id_descuento, monto_aplicado)
         VALUES (?, ?, ?)`,
        [id_pedido, descuento.id_descuento, monto_aplicado]
      );

      // Actualizar total del pedido
      await conn.query(`UPDATE pedidos SET total = ? WHERE id_pedido = ?`, [
        nuevo_total,
        id_pedido,
      ]);

      await conn.commit();
      return { codigo, tipo: descuento.tipo, monto_aplicado, nuevo_total };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = DescuentosService;
