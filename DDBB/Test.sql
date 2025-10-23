-- =====================================================================
-- SCRIPT DE PRUEBAS DE LA BASE DE DATOS: FigureVerse
-- Autor: Ariel & Bautista
-- Objetivo: Verificar que las relaciones y datos básicos funcionan correctamente.
-- =====================================================================

USE figureverse;

-- =====================================================
-- PRUEBA 1: Listar todos los usuarios y sus roles
-- =====================================================
-- Verifica que existan el super_admin, los admins y los clientes
SELECT id_usuario, nombre_usuario, rol, estado, fecha_registro
FROM usuarios
ORDER BY FIELD(rol, 'super_admin','admin','cliente');

-- Esperado:
-- 1 super_admin, 2 admin, 3 clientes


-- =====================================================
-- PRUEBA 2: Verificar relaciones 1:1 entre usuarios y administradores/clientes
-- =====================================================
-- A) Administradores con su información de usuario
SELECT a.id_admin, u.nombre_usuario, a.nombre, a.apellido, a.cargo, a.area
FROM administradores a
JOIN usuarios u ON a.id_usuario = u.id_usuario;

-- B) Clientes con su información de usuario
SELECT c.id_cliente, u.nombre_usuario, c.nombre, c.apellido, c.ciudad, c.provincia
FROM clientes c
JOIN usuarios u ON c.id_usuario = u.id_usuario;

-- Esperado:
-- 3 administradores (1 super_admin incluido)
-- 3 clientes correctamente vinculados


-- =====================================================
-- PRUEBA 3: Listar los productos y su información relacionada
-- =====================================================
-- Verifica que los productos tengan categoría, universo y fabricante válidos
SELECT 
  p.id_producto,
  p.nombre,
  c.nombre_categoria AS categoria,
  u.nombre AS universo,
  f.nombre AS fabricante,
  p.precio_base,
  p.stock
FROM productos p
JOIN categorias c ON p.id_categoria = c.id_categoria
JOIN universos u ON p.id_universo = u.id_universo
JOIN fabricantes f ON p.id_fabricante = f.id_fabricante;

-- Esperado:
-- Funko Pop! Spider-Man  → Marvel / Funko
-- Goku Super Saiyan PVC  → Anime / Bandai


-- =====================================================
-- PRUEBA 4: Verificar las variantes de productos
-- =====================================================
SELECT 
  v.id_variante,
  p.nombre AS producto,
  v.atributo,
  v.valor,
  v.precio,
  v.stock,
  v.sku
FROM variantes_producto v
JOIN productos p ON v.id_producto = p.id_producto
ORDER BY p.nombre;

-- Esperado:
-- Spider-Man → Clásica / Traje Negro
-- Goku → Cabello Dorado


-- =====================================================
-- PRUEBA 5: Verificar las imágenes asociadas
-- =====================================================
SELECT 
  p.nombre AS producto,
  i.url_imagen,
  i.alt_text
FROM imagenes_productos i
JOIN productos p ON i.id_producto = p.id_producto;

-- Esperado:
-- Cada producto debe tener al menos una imagen vinculada.


-- =====================================================
-- PRUEBA 6: Verificar el carrito activo del cliente "carlos_fx"
-- =====================================================
SELECT 
  u.nombre_usuario,
  c.id_carrito,
  cd.id_detalle,
  p.nombre AS producto,
  v.valor AS variante,
  cd.cantidad,
  cd.precio_unitario,
  (cd.precio_unitario + cd.iva_monto) AS total_item
FROM carrito c
JOIN carrito_detalle cd ON c.id_carrito = cd.id_carrito
JOIN productos p ON cd.id_producto = p.id_producto
LEFT JOIN variantes_producto v ON cd.id_variante = v.id_variante
JOIN usuarios u ON c.id_usuario = u.id_usuario
WHERE u.nombre_usuario = 'carlos_fx';

-- Esperado:
-- Un carrito activo con 1 producto “Funko Pop! Spider-Man”.


-- =====================================================
-- PRUEBA 7: Verificar el pedido, pago y factura de ese cliente
-- =====================================================

-- A) Pedido general
SELECT 
  pe.id_pedido,
  u.nombre_usuario,
  pe.subtotal,
  pe.costo_envio,
  pe.total,
  pe.estado
FROM pedidos pe
JOIN usuarios u ON pe.id_usuario = u.id_usuario
WHERE u.nombre_usuario = 'carlos_fx';

-- B) Detalle del pedido
SELECT 
  pd.id_detalle,
  p.nombre AS producto,
  v.valor AS variante,
  pd.cantidad,
  pd.precio_unitario,
  pd.iva_monto
FROM pedido_detalle pd
JOIN productos p ON pd.id_producto = p.id_producto
LEFT JOIN variantes_producto v ON pd.id_variante = v.id_variante
WHERE pd.id_pedido = (SELECT id_pedido FROM pedidos WHERE id_usuario = (SELECT id_usuario FROM usuarios WHERE nombre_usuario='carlos_fx'));

-- C) Pago asociado
SELECT 
  pa.id_pago,
  pa.metodo_pago,
  pa.estado_pago,
  pa.monto,
  pa.fecha_pago
FROM pagos pa
WHERE pa.id_pedido = (SELECT id_pedido FROM pedidos WHERE id_usuario = (SELECT id_usuario FROM usuarios WHERE nombre_usuario='carlos_fx'));

-- D) Factura generada
SELECT 
  f.numero_factura,
  f.tipo_factura,
  f.subtotal,
  f.total,
  f.metodo_pago,
  f.estado_factura,
  ef.email_destinatario,
  ef.estado_envio
FROM facturas f
JOIN envio_facturas ef ON ef.id_factura = f.id_factura
WHERE f.id_pedido = (SELECT id_pedido FROM pedidos WHERE id_usuario = (SELECT id_usuario FROM usuarios WHERE nombre_usuario='carlos_fx'));

-- Esperado:
-- Pedido “pagado”, factura emitida y envío pendiente de correo.


-- =====================================================
-- PRUEBA 8: Consultar el historial del pedido
-- =====================================================
SELECT 
  hp.id_historial,
  hp.estado_anterior,
  hp.estado_nuevo,
  hp.fecha_cambio,
  u.nombre_usuario AS cambiado_por,
  hp.comentario
FROM historial_pedidos hp
LEFT JOIN usuarios u ON hp.id_usuario = u.id_usuario
WHERE hp.id_pedido = (SELECT id_pedido FROM pedidos WHERE id_usuario = (SELECT id_usuario FROM usuarios WHERE nombre_usuario='carlos_fx'))
ORDER BY hp.fecha_cambio;

-- Esperado:
-- Dos entradas: 
-- 1. Creado por root_master (pendiente)
-- 2. Actualizado por admin_akira (pagado)


-- =====================================================
-- PRUEBA 9: Verificar integridad de llaves foráneas
-- =====================================================
-- Muestra todas las tablas con referencias válidas
SELECT 
  table_name, constraint_name, referenced_table_name
FROM information_schema.KEY_COLUMN_USAGE
WHERE referenced_table_name IS NOT NULL
AND table_schema = 'figureverse';

-- Esperado:
-- Todas las relaciones fk_clientes_usuario, fk_admins_usuario, fk_prod_cat, etc.


-- =====================================================
-- PRUEBA 10: Consultas agregadas de control
-- =====================================================
-- A) Total de usuarios por rol
SELECT rol, COUNT(*) AS cantidad FROM usuarios GROUP BY rol;

-- B) Total de productos activos
SELECT COUNT(*) AS productos_activos FROM productos WHERE estado='activo';

-- C) Total de pedidos pagados
SELECT COUNT(*) AS pedidos_pagados FROM pedidos WHERE estado='pagado';

-- D) Promedio de precio base de productos
SELECT AVG(precio_base) AS promedio_precio FROM productos;

-- E) Total de stock general
SELECT SUM(stock) AS stock_total FROM productos;
