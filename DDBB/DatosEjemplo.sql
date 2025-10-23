USE figureverse;

-- ----------------------------------------------------------
-- Variables de usuarios
-- ----------------------------------------------------------
INSERT INTO usuarios (nombre_usuario, email, password_hash, rol, estado)
VALUES
  ('root_master', 'root@figureverse.test', 'PLAINTEXT_NOT_FOR_PROD:Admin123!', 'super_admin', 'activo'),
  ('admin_akira', 'akira.admin@figureverse.test', 'PLAINTEXT_NOT_FOR_PROD:Admin123!', 'admin', 'activo'),
  ('admin_dana',  'dana.admin@figureverse.test',  'PLAINTEXT_NOT_FOR_PROD:Admin123!', 'admin', 'activo'),
  ('carlos_fx',   'carlos@figureverse.test',  'PLAINTEXT_NOT_FOR_PROD:User123!', 'cliente', 'activo'),
  ('brenda_otk',  'brenda@figureverse.test',  'PLAINTEXT_NOT_FOR_PROD:User123!', 'cliente', 'activo'),
  ('leo_kun',     'leo@figureverse.test',     'PLAINTEXT_NOT_FOR_PROD:User123!', 'cliente', 'activo');

-- Asignamos variables con los IDs recién generados
SELECT 
  @id_root   := id_usuario FROM usuarios WHERE nombre_usuario='root_master';
SELECT 
  @id_akira  := id_usuario FROM usuarios WHERE nombre_usuario='admin_akira';
SELECT 
  @id_dana   := id_usuario FROM usuarios WHERE nombre_usuario='admin_dana';
SELECT 
  @id_carlos := id_usuario FROM usuarios WHERE nombre_usuario='carlos_fx';
SELECT 
  @id_brenda := id_usuario FROM usuarios WHERE nombre_usuario='brenda_otk';
SELECT 
  @id_leo    := id_usuario FROM usuarios WHERE nombre_usuario='leo_kun';

-- ----------------------------------------------------------
-- Administradores (incluye super_admin)
-- ----------------------------------------------------------
INSERT INTO administradores (id_usuario, nombre, apellido, dni, telefono, cargo, area) VALUES
  (@id_root,  'Ariel', 'Super', '200000001', '+54 11 1111-1111', 'Super Admin', 'otro'),
  (@id_akira, 'Akira', 'Sato',  '200000002', '+54 11 2222-2222', 'Administrador', 'inventario'),
  (@id_dana,  'Dana',  'Rivas', '200000003', '+54 11 3333-3333', 'Administradora', 'ventas');

-- ----------------------------------------------------------
-- Clientes
-- ----------------------------------------------------------
INSERT INTO clientes (id_usuario, nombre, apellido, dni, telefono, direccion, numero, ciudad, provincia, pais, codigo_postal, fecha_nacimiento, preferencias)
VALUES
  (@id_carlos, 'Carlos','Fernández','3000010001', '+54 11 4444-4444', 'Av. Siempre Viva','742','CABA','Buenos Aires','Argentina','1000','1990-05-10','Marvel, Funko Pop'),
  (@id_brenda, 'Brenda','Ortiz','3000010002', '+54 11 5555-5555', 'San Martín','123','Rosario','Santa Fe','Argentina','2000','1995-11-22','Anime, Bandai'),
  (@id_leo,    'Leandro','Sosa','3000010003', '+54 11 6666-6666', 'Belgrano','456','Córdoba','Córdoba','Argentina','5000','1999-03-15','Dragon Ball, PVC');

-- ----------------------------------------------------------
-- Universos / Fabricantes / Categorías
-- ----------------------------------------------------------
INSERT INTO universos (nombre, descripcion) VALUES
  ('Marvel', 'Superhéroes de Marvel'),
  ('Anime', 'Series y películas japonesas');

INSERT INTO fabricantes (nombre, pais_origen, sitio_web) VALUES
  ('Funko', 'Estados Unidos', 'https://www.funko.com'),
  ('Bandai', 'Japón', 'https://www.bandai.com');

INSERT INTO categorias (nombre_categoria, descripcion) VALUES
  ('Funko Pop', 'Vinilos coleccionables estilo chibi'),
  ('Figuras PVC', 'Figuras articuladas de PVC');

-- ----------------------------------------------------------
-- Productos y variantes
-- ----------------------------------------------------------
INSERT INTO productos (nombre, descripcion, precio_base, stock, stock_minimo, id_categoria, id_universo, id_fabricante, anio_lanzamiento, estado)
VALUES
  ('Funko Pop! Spider-Man', 'Edición clásica de Spider-Man', 15000, 50, 5,
   (SELECT id_categoria FROM categorias WHERE nombre_categoria='Funko Pop'),
   (SELECT id_universo FROM universos WHERE nombre='Marvel'),
   (SELECT id_fabricante FROM fabricantes WHERE nombre='Funko'),
   2024, 'activo'),

  ('Goku Super Saiyan PVC 1/12', 'Figura articulada de Goku SSJ', 120000, 10, 2,
   (SELECT id_categoria FROM categorias WHERE nombre_categoria='Figuras PVC'),
   (SELECT id_universo FROM universos WHERE nombre='Anime'),
   (SELECT id_fabricante FROM fabricantes WHERE nombre='Bandai'),
   2023, 'activo');

SET @id_spiderman := (SELECT id_producto FROM productos WHERE nombre='Funko Pop! Spider-Man');
SET @id_goku := (SELECT id_producto FROM productos WHERE nombre='Goku Super Saiyan PVC 1/12');

INSERT INTO variantes_producto (id_producto, atributo, valor, precio, stock, sku)
VALUES
  (@id_spiderman, 'Versión', 'Clásica', NULL, 30, 'FUN-SPDMAN-CLS'),
  (@id_spiderman, 'Versión', 'Traje Negro', 16990.00, 20, 'FUN-SPDMAN-BLK'),
  (@id_goku, 'Cabello', 'Dorado', NULL, 10, 'BAN-GOKU-SSJ-112');

-- ----------------------------------------------------------
-- Ejemplo: Pedido, Pago y Factura de Carlos
-- ----------------------------------------------------------
INSERT INTO carrito (id_usuario) VALUES (@id_carlos);

SET @id_carrito := LAST_INSERT_ID();

INSERT INTO carrito_detalle (id_carrito, id_producto, id_variante, cantidad, precio_unitario, iva_porcentaje, iva_monto)
VALUES (@id_carrito,
  @id_spiderman,
  (SELECT id_variante FROM variantes_producto WHERE sku='FUN-SPDMAN-CLS'),
  1, 15000, 21.00, 3150.00);

INSERT INTO pedidos (id_usuario, subtotal, costo_envio, total, estado)
VALUES (@id_carlos, 15000, 2500, 17500, 'pendiente');

SET @id_pedido := LAST_INSERT_ID();

INSERT INTO pedido_detalle (id_pedido, id_producto, id_variante, cantidad, precio_unitario, iva_porcentaje, iva_monto)
VALUES (@id_pedido, @id_spiderman,
  (SELECT id_variante FROM variantes_producto WHERE sku='FUN-SPDMAN-CLS'),
  1, 15000, 21.00, 3150.00);

INSERT INTO historial_pedidos (id_pedido, estado_nuevo, id_usuario, comentario)
VALUES (@id_pedido, 'pendiente', @id_root, 'Pedido creado automáticamente');

INSERT INTO pagos (id_pedido, metodo_pago, estado_pago, id_transaccion, monto, fecha_pago)
VALUES (@id_pedido, 'mercado_pago', 'aprobado', 'TEST-TRANS-001', 17500, NOW());

UPDATE pedidos SET estado='pagado' WHERE id_pedido=@id_pedido;

INSERT INTO historial_pedidos (id_pedido, estado_anterior, estado_nuevo, id_usuario, comentario)
VALUES (@id_pedido, 'pendiente', 'pagado', @id_akira, 'Pago aprobado (prueba)');

INSERT INTO envios (id_pedido, destinatario, direccion_envio, ciudad, provincia, codigo_postal, empresa_envio, numero_seguimiento, estado_envio, fecha_envio)
VALUES (@id_pedido, 'Carlos Fernández', 'Av. Siempre Viva 742', 'CABA', 'Buenos Aires', '1000', 'Correo Argentino', 'TRK-AR-0001', 'en_camino', NOW());

INSERT INTO descuentos (codigo, descripcion, tipo, valor, fecha_inicio, fecha_fin)
VALUES ('BIENVENIDA10', '10% de descuento de bienvenida', 'porcentaje', 10, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY));

INSERT INTO facturas (id_pedido, numero_factura, tipo_factura, subtotal, iva_monto, total, metodo_pago, url_pdf, hash_verificacion)
VALUES (@id_pedido, 'FV-2025-000001', 'B', 15000, 3150, 17500, 'mercado_pago', 'https://cdn.example.com/facturas/FV-2025-000001.pdf', REPEAT('a',64));

INSERT INTO envio_facturas (id_factura, email_destinatario, cuerpo_mensaje)
VALUES ((SELECT id_factura FROM facturas WHERE numero_factura='FV-2025-000001'),
  'carlos@figureverse.test', '¡Gracias por tu compra! Adjuntamos tu factura.');
