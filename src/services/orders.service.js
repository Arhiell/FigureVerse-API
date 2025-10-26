const pool = require("../config/db");

const OrdersService = {
  // Obtener todos los pedidos (solo admin/superadmin)
  getAllOrders: async () => {
    const [rows] = await pool.query(`
      SELECT p.*, u.nombre_usuario
      FROM pedidos p
      JOIN usuarios u ON u.id_usuario = p.id_usuario
      ORDER BY p.fecha_pedido DESC
    `);
    return rows;
  },

  // Obtener pedidos de un usuario específico
  getUserOrders: async (id_usuario) => {
    const [rows] = await pool.query(
      `
      SELECT * FROM pedidos
      WHERE id_usuario = ?
      ORDER BY fecha_pedido DESC
    `,
      [id_usuario]
    );
    return rows;
  },

  // Obtener un pedido por ID
  getOrderById: async (id_pedido) => {
    const [rows] = await pool.query(
      `
      SELECT p.*, u.nombre_usuario, u.email
      FROM pedidos p
      JOIN usuarios u ON u.id_usuario = p.id_usuario
      WHERE p.id_pedido = ?
    `,
      [id_pedido]
    );

    if (rows.length === 0) throw new Error("Pedido no encontrado");

    const [detalles] = await pool.query(
      `
      SELECT * FROM pedido_detalle WHERE id_pedido = ?
    `,
      [id_pedido]
    );

    return { pedido: rows[0], detalles };
  },

  // Crear nuevo pedido
  createOrder: async (pedidoData) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const {
        id_usuario,
        subtotal,
        descuento_total,
        costo_envio,
        total,
        metodo_entrega,
        notas,
        detalles,
      } = pedidoData;

      // Insertar pedido principal
      const [pedidoResult] = await conn.query(
        `INSERT INTO pedidos (id_usuario, subtotal, descuento_total, costo_envio, total, metodo_entrega, notas)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id_usuario,
          subtotal,
          descuento_total,
          costo_envio,
          total,
          metodo_entrega,
          notas,
        ]
      );

      const id_pedido = pedidoResult.insertId;

      // Insertar detalle del pedido
      for (const item of detalles) {
        await conn.query(
          `INSERT INTO pedido_detalle (id_pedido, id_producto, id_variante, cantidad, precio_unitario, iva_porcentaje, iva_monto)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id_pedido,
            item.id_producto,
            item.id_variante || null,
            item.cantidad,
            item.precio_unitario,
            item.iva_porcentaje,
            item.iva_monto,
          ]
        );
      }

      // Registrar en historial
      await conn.query(
        `INSERT INTO historial_pedidos (id_pedido, estado_nuevo, id_usuario, comentario)
         VALUES (?, 'pendiente', ?, 'Pedido creado por cliente')`,
        [id_pedido, id_usuario]
      );

      await conn.commit();
      return { id_pedido };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  // Actualizar estado del pedido
  updateOrderStatus: async (
    id_pedido,
    id_usuario,
    estado_nuevo,
    comentario
  ) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Estado anterior
      const [pedido] = await conn.query(
        "SELECT estado FROM pedidos WHERE id_pedido = ?",
        [id_pedido]
      );
      if (pedido.length === 0) throw new Error("Pedido no encontrado");

      const estado_anterior = pedido[0].estado;

      // Actualizar pedido
      await conn.query("UPDATE pedidos SET estado = ? WHERE id_pedido = ?", [
        estado_nuevo,
        id_pedido,
      ]);

      // Registrar en historial
      await conn.query(
        `INSERT INTO historial_pedidos (id_pedido, estado_anterior, estado_nuevo, id_usuario, comentario)
         VALUES (?, ?, ?, ?, ?)`,
        [id_pedido, estado_anterior, estado_nuevo, id_usuario, comentario]
      );

      await conn.commit();
      return { id_pedido, estado_nuevo };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = OrdersService;
