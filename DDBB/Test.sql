-- ======================================================================
-- Script de testeo general para verificar el correcto funcionamiento del
-- modelo relacional de la base de datos "figureverse", incluyendo:
--  - Integridad referencial (joins entre tablas)
--  - Relaciones lógicas y coherencia de datos
--  - Ejemplos de triggers y funciones simples
--  - Resultados esperados de las principales operaciones
-- ======================================================================

USE figureverse;

-- ======================================================================
-- 1) VERIFICACIÓN GENERAL DE DATOS BÁSICOS
-- ----------------------------------------------------------------------
-- Objetivo: comprobar que las tablas principales contienen registros
-- y que los roles/usuarios están correctamente distribuidos.
-- ======================================================================

-- Contar usuarios por rol
SELECT rol, COUNT(*) AS cantidad
FROM usuarios
GROUP BY rol;

-- Verificar clientes y administradores con sus nombres de usuario
SELECT u.id_usuario, u.nombre_usuario, c.nombre AS nombre_cliente, c.apellido AS apellido_cliente
FROM usuarios u
LEFT JOIN clientes c ON u.id_usuario = c.id_usuario
LEFT JOIN administradores a ON u.id_usuario = a.id_usuario
ORDER BY u.id_usuario;

-- ======================================================================
-- 2) RELACIONES ENTRE PRODUCTOS Y CATEGORÍAS
-- ----------------------------------------------------------------------
-- Objetivo: confirmar integridad de FK y correspondencia de categorías
-- ======================================================================

-- Productos y sus categorías principales
SELECT p.id_producto, p.nombre AS producto, c.nombre_categoria AS categoria_principal, p.precio_base, p.stock
FROM productos p
INNER JOIN categorias c ON p.id_categoria = c.id_categoria;

-- Variantes de productos (si las hay)
SELECT v.id_variante, p.nombre AS producto, v.atributo, v.valor, v.precio, v.stock
FROM variantes_producto v
INNER JOIN productos p ON v.id_producto = p.id_producto;

-- ======================================================================
-- 3) RELACIONES ENTRE USUARIOS Y CARRITOS
-- ----------------------------------------------------------------------
-- Objetivo: verificar que cada usuario tenga su carrito y sus productos
-- ======================================================================

-- Carritos activos y sus propietarios
SELECT c.id_carrito, u.nombre_usuario, c.estado, COUNT(cd.id_detalle) AS cantidad_items
FROM carrito c
LEFT JOIN carrito_detalle cd ON c.id_carrito = cd.id_carrito
INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
GROUP BY c.id_carrito;

-- Detalle de cada carrito (usuario + productos)
SELECT u.nombre_usuario, p.nombre AS producto, cd.cantidad, cd.precio_unitario, cd.iva_monto
FROM carrito_detalle cd
INNER JOIN carrito c ON cd.id_carrito = c.id_carrito
INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
INNER JOIN productos p ON cd.id_producto = p.id_producto
ORDER BY u.nombre_usuario;

-- ======================================================================
-- 4) RELACIÓN COMPLETA: PEDIDOS, PAGOS, FACTURAS Y ENVÍOS
-- ----------------------------------------------------------------------
-- Objetivo: verificar la trazabilidad completa del proceso de compra
-- ======================================================================

SELECT 
    u.nombre_usuario AS cliente,
    p.id_pedido,
    p.estado AS estado_pedido,
    pa.estado_pago,
    f.numero_factura,
    e.estado_envio,
    p.total AS monto_total
FROM pedidos p
INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
LEFT JOIN pagos pa ON p.id_pedido = pa.id_pedido
LEFT JOIN facturas f ON p.id_pedido = f.id_pedido
LEFT JOIN envios e ON p.id_pedido = e.id_pedido
ORDER BY p.id_pedido;

-- ======================================================================
-- 5) VERIFICACIÓN DE CALIFICACIONES Y RESEÑAS
-- ----------------------------------------------------------------------
-- Objetivo: comprobar relación usuario-producto y valoraciones
-- ======================================================================

SELECT r.id_reseña, u.nombre_usuario, p.nombre AS producto, r.calificacion, r.comentario
FROM resenas r
INNER JOIN usuarios u ON r.id_usuario = u.id_usuario
INNER JOIN productos p ON r.id_producto = p.id_producto
ORDER BY r.fecha_resena DESC;

-- ======================================================================
-- 6) TEST DE DESCUENTOS Y RELACIONES N:M
-- ----------------------------------------------------------------------
-- Objetivo: comprobar si los descuentos se asocian correctamente a pedidos
-- ======================================================================

SELECT d.codigo, d.tipo, d.valor, pd.id_pedido, pd.monto_aplicado
FROM descuentos d
LEFT JOIN pedidos_descuentos pd ON d.id_descuento = pd.id_descuento;

-- ======================================================================
-- 7) REGISTROS DE SOPORTE Y LOGS DE ACTIVIDAD
-- ----------------------------------------------------------------------
-- Objetivo: verificar coherencia entre usuario y su interacción
-- ======================================================================

SELECT s.id_soporte, u.nombre_usuario, s.asunto, s.estado
FROM soporte s
INNER JOIN usuarios u ON s.id_usuario = u.id_usuario;

SELECT l.id_log, u.nombre_usuario, l.accion, l.fecha_hora
FROM logs l
LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
ORDER BY l.fecha_hora DESC;

-- ======================================================================
-- 8) HISTORIAL DE PEDIDOS
-- ----------------------------------------------------------------------
-- Objetivo: comprobar auditoría de cambios de estado
-- ======================================================================

SELECT h.id_historial, p.id_pedido, h.estado_anterior, h.estado_nuevo, u.nombre_usuario AS responsable
FROM historial_pedidos h
INNER JOIN pedidos p ON h.id_pedido = p.id_pedido
LEFT JOIN usuarios u ON h.id_usuario = u.id_usuario
ORDER BY h.fecha_cambio DESC;

-- ======================================================================
-- 9) TRIGGERS Y FUNCIONES (PRUEBAS SIMPLES)
-- ----------------------------------------------------------------------
-- Si tu base aún no tiene triggers, puedes probar estos ejemplos
-- para validar automatizaciones y lógica.
-- ======================================================================

-- 9.1 Trigger de auditoría: registrar cada nuevo pedido
DELIMITER //
CREATE TRIGGER trg_log_nuevo_pedido
AFTER INSERT ON pedidos
FOR EACH ROW
BEGIN
  INSERT INTO logs (id_usuario, accion, ip, user_agent)
  VALUES (NEW.id_usuario, CONCAT('Nuevo pedido registrado (ID ', NEW.id_pedido, ')'),
          '127.0.0.1', 'TriggerTest');
END //
DELIMITER ;

-- 9.2 Probar el trigger insertando un nuevo pedido ficticio
INSERT INTO pedidos (id_usuario, subtotal, descuento_total, costo_envio, total, estado)
VALUES (3, 10000.00, 0.00, 0.00, 10000.00, 'pendiente');

-- 9.3 Verificar que el trigger insertó un registro en logs
SELECT * FROM logs ORDER BY id_log DESC LIMIT 5;

-- 9.4 Función de utilidad: calcular el total de productos en stock
DELIMITER //
CREATE FUNCTION fn_total_stock() RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE total INT;
  SELECT SUM(stock) INTO total FROM productos;
  RETURN total;
END //
DELIMITER ;

-- 9.5 Ejecutar la función
SELECT fn_total_stock() AS total_productos_en_stock;

-- ======================================================================
-- 10) LIMPIEZA DE PRUEBA (opcional)
-- ----------------------------------------------------------------------
-- Eliminar registros de prueba generados por triggers o funciones
-- ======================================================================

DELETE FROM pedidos WHERE estado='pendiente' AND total=10000.00;
DELETE FROM logs WHERE user_agent='TriggerTest';

-- ======================================================================
-- FIN DE TESTEO GENERAL DE BASE DE DATOS
-- ----------------------------------------------------------------------
-- Si todas las consultas devuelven resultados coherentes y sin errores,
-- significa que el modelo funciona correctamente, las relaciones son
-- válidas y las automatizaciones cumplen su función.
-- ======================================================================