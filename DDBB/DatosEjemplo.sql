-- ======================================================================
-- Ejecutar después de haber creado la base de datos con figureverse.sql
-- ======================================================================

USE figureverse;

-- ----------------------------------------------------------------------
-- 1) USUARIOS
-- ----------------------------------------------------------------------
INSERT INTO usuarios (nombre_usuario, email, password_hash, rol, estado)
VALUES
('superadmin', 'superadmin@gmail.com', 'hash_superadmin', 'admin', 'activo'),
('admin_jose', 'admin.jose@gmail.com', 'hash_admin', 'admin', 'activo'),
('cliente_maria', 'maria.gomez@gmail.com', 'hash_maria', 'cliente', 'activo'),
('cliente_juan', 'juan.perez@gmail.com', 'hash_juan', 'cliente', 'activo');

-- ----------------------------------------------------------------------
-- 2) ADMINISTRADORES
-- ----------------------------------------------------------------------
INSERT INTO administradores (id_usuario, dni, nombre, apellido, telefono, cargo)
VALUES
(1, '30111222', 'Super', 'Admin', '3794123456', 'Superadministrador'),
(2, '32122333', 'José', 'Ramírez', '3794876543', 'Administrador General');

-- ----------------------------------------------------------------------
-- 3) CLIENTES
-- ----------------------------------------------------------------------
INSERT INTO clientes (id_usuario, dni, nombre, apellido, telefono, direccion, ciudad, provincia, pais, codigo_postal)
VALUES
(3, '40111222', 'María', 'Gómez', '3794123344', 'Av. San Martín 123', 'Resistencia', 'Chaco', 'Argentina', '3500'),
(4, '42122333', 'Juan', 'Pérez', '3794765544', 'Belgrano 456', 'Corrientes', 'Corrientes', 'Argentina', '3400');

-- ----------------------------------------------------------------------
-- 4) CATEGORÍAS
-- ----------------------------------------------------------------------
INSERT INTO categorias (nombre_categoria, descripcion)
VALUES
('Anime', 'Figuras de acción y coleccionables de anime'),
('Videojuegos', 'Figuras de acción y coleccionables de videojuegos'),
('Peliculas', 'Figuras de acción y coleccionables de películas'),
('Juegos de Mesa', 'Figuras de acción y coleccionables de juegos de mesa');

-- ----------------------------------------------------------------------
-- 5) PRODUCTOS
-- ----------------------------------------------------------------------
INSERT INTO productos (nombre, descripcion, precio_base, stock, id_categoria)
VALUES
('Naruto Usumaki Sage', 'Figura de acción de Naruto Uzumaki modo sabio, serie Naruto, escala 1/10', 950000.00, 12, 1),
('Shinji Ikari', 'Figura de acción de Shinji Ikari, anime Neon Genesis Evangelion, escala 1/10', 520000.00, 25, 2),
('Sanji Vinsmoke', 'Figura de acción de Sanji Vinsmoke, anime One Piece, escala 1/10', 15000.00, 100, 3),
('Misato Katsuragi', 'Figura de acción de Misato Katsuragi, anime Neon Genesis Evangelion, escala 1/10', 28000.00, 60, 4);

-- ----------------------------------------------------------------------
-- 6) VARIANTES DE PRODUCTOS
-- ----------------------------------------------------------------------
/*INSERT INTO variantes_producto (id_producto, atributo, valor, precio, stock, sku)
VALUES
(1, 'Modo Sabio', 'Rojo', 970000.00, 6, 'LAP16-3000'),
(1, 'Modo Sabio', 'Naranja', 1050000.00, 6, 'LAP32-3000'),
(2, 'Con silla', 'Negro', NULL, 10, 'CELNQPRO'),
(2, 'Con silla', 'Azul', NULL, 15, 'CELAZPRO');*/

-- ----------------------------------------------------------------------
-- 7) IMÁGENES DE PRODUCTOS
-- ----------------------------------------------------------------------
INSERT INTO imagenes_productos (id_producto, url_imagen, posicion, alt_text)
VALUES
(1, 'https://figureverse.com/img/laptop1.png', 1, 'Naruto Uzumaki Sage'),
(2, 'https://figureverse.com/img/celular1.png', 1, 'Shinji Ikari'),
(3, 'https://figureverse.com/img/mouse1.png', 1, 'Sanji Vinsmoke'),
(4, 'https://figureverse.com/img/audio1.png', 1, 'Misato Katsuragi');

-- ----------------------------------------------------------------------
-- 8) CARRITO Y DETALLE
-- ----------------------------------------------------------------------
INSERT INTO carrito (id_usuario, estado)
VALUES
(3, 'activo'),
(4, 'activo');

INSERT INTO carrito_detalle (id_carrito, id_producto, cantidad, precio_unitario, iva_porcentaje, iva_monto)
VALUES
(1, 2, 1, 520000.00, 21.00, 90165.29),
(2, 3, 2, 15000.00, 21.00, 5206.61);

-- ----------------------------------------------------------------------
-- 9) PEDIDOS
-- ----------------------------------------------------------------------
INSERT INTO pedidos (id_usuario, subtotal, descuento_total, costo_envio, total, estado, metodo_entrega)
VALUES
(3, 520000.00, 0.00, 5000.00, 525000.00, 'pagado', 'envio_domicilio'),
(4, 30000.00, 0.00, 0.00, 30000.00, 'pendiente', 'retiro');

-- ----------------------------------------------------------------------
-- 10) PAGOS
-- ----------------------------------------------------------------------
INSERT INTO pagos (id_pedido, metodo_pago, estado_pago, id_transaccion, monto, fecha_pago)
VALUES
(1, 'mercado_pago', 'aprobado', 'MP-001-ABC', 525000.00, NOW()),
(2, 'mercado_pago', 'pendiente', 'MP-002-DEF', 30000.00, NULL);

-- ----------------------------------------------------------------------
-- 11) FACTURAS
-- ----------------------------------------------------------------------
INSERT INTO facturas (numero_factura, id_pedido, id_pago, id_usuario, tipo, subtotal, iva_total, total)
VALUES
('F0001-00000001', 1, 1, 3, 'B', 430000.00, 90300.00, 520300.00);

-- ----------------------------------------------------------------------
-- 12) ENVÍOS
-- ----------------------------------------------------------------------
INSERT INTO envios (id_pedido, direccion_envio, ciudad, provincia, pais, codigo_postal, empresa_envio, numero_seguimiento, estado_envio)
VALUES
(1, 'Av. San Martín 123', 'Resistencia', 'Chaco', 'Argentina', '3500', 'Andreani', 'TRK-12345', 'en_camino');

-- ----------------------------------------------------------------------
-- 13) RESEÑAS
-- ----------------------------------------------------------------------
INSERT INTO resenas (id_producto, id_usuario, calificacion, comentario)
VALUES
(1, 3, 5, 'Excelente laptop, rendimiento impresionante.'),
(2, 4, 4, 'Muy buen celular, aunque la batería podría durar más.');

-- ----------------------------------------------------------------------
-- 14) DESCUENTOS
-- ----------------------------------------------------------------------
INSERT INTO descuentos (codigo, descripcion, tipo, valor, fecha_inicio, fecha_fin)
VALUES
('FERA10', '10% de descuento en laptops', 'porcentaje', 10.00, '2025-10-01', '2025-12-31');

-- ----------------------------------------------------------------------
-- 15) SOPORTE
-- ----------------------------------------------------------------------
INSERT INTO soporte (id_usuario, asunto, mensaje, canal)
VALUES
(3, 'Problema con envío', 'No recibí el número de seguimiento en el correo.', 'web');

-- ----------------------------------------------------------------------
-- 16) LOGS
-- ----------------------------------------------------------------------
INSERT INTO logs (id_usuario, accion, ip, user_agent)
VALUES
(3, 'Inicio de sesión exitoso', '192.168.0.5', 'Chrome/Windows 10'),
(1, 'Creación de nuevo producto', '192.168.0.1', 'Firefox/Linux');

-- ----------------------------------------------------------------------
-- 17) HISTORIAL DE PEDIDOS
-- ----------------------------------------------------------------------
INSERT INTO historial_pedidos (id_pedido, estado_anterior, estado_nuevo, id_usuario)
VALUES
(1, 'pendiente', 'pagado', 1);