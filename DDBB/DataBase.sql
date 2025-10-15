-- ======================================================================
-- Base de datos para e-commerce (tienda online)
-- Diseño relacional con integridad referencial y optimización básica
-- ======================================================================
/*
-- NOTA: para reiniciar la base de datos, descomentar las siguientes líneas
DROP DATABASE IF EXISTS figureverse;
DROP USER IF EXISTS 'administrador'@'%';
DROP USER IF EXISTS 'usuario'@'%';
DROP USER IF EXISTS 'doneit_user'@'localhost';
*/ 


/* ----------------------------------------------------------------------
   0) CREACIÓN DE BASE DE DATOS
   - Charset/Collation: UTF8MB4 para compatibilidad total con Emojis
     y ordenamiento Unicode.
   ---------------------------------------------------------------------- */
CREATE DATABASE IF NOT EXISTS figureverse
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE figureverse;


/* ======================================================================
   1) USUARIOS Y PERFILES
   ----------------------------------------------------------------------
   Propósito del módulo:
   - Gestionar credenciales, roles y perfiles de las personas que usan
     el sistema (clientes y administradores/staff).
   - Estructura: tabla base de usuarios + perfiles específicos.
   ====================================================================== */

-- ----------------------------------------------------------------------
-- Tabla: usuarios
-- Representa la cuenta de acceso (login) y su estado/rol.
-- ----------------------------------------------------------------------
CREATE TABLE usuarios (
  id_usuario       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  nombre_usuario   VARCHAR(100) NOT NULL UNIQUE,             -- alias/login único
  email            VARCHAR(150) NOT NULL UNIQUE,             -- correo único
  password_hash    VARCHAR(255) NOT NULL,                    -- hash (bcrypt/argon2)
  rol              ENUM('cliente','admin') NOT NULL,         -- rol global del usuario
  estado           ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',  -- habilitado?
  fecha_registro   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,          -- alta
  ultimo_login     DATETIME NULL,                             -- último acceso
  -- Auditoría mínima (timestamps):
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------
-- Tabla: clientes
-- Perfil de cliente (datos personales y de envío). 1:1 con usuarios.
-- ----------------------------------------------------------------------
CREATE TABLE clientes (
  id_cliente       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  id_usuario       INT UNSIGNED NOT NULL UNIQUE,             -- FK a usuarios, relación 1:1
  dni              VARCHAR(20) NOT NULL UNIQUE,              -- DNI Arg (VARCHAR por prefijos/formatos)
  nombre           VARCHAR(100) NOT NULL,                    -- nombre(s)
  apellido         VARCHAR(100) NOT NULL,                    -- apellido(s)
  telefono         VARCHAR(25)  NULL,                        -- contacto
  direccion        VARCHAR(255) NOT NULL,                    -- calle + número
  ciudad           VARCHAR(100) NOT NULL,
  provincia        VARCHAR(100) NOT NULL,
  pais             VARCHAR(100) NOT NULL DEFAULT 'Argentina',
  codigo_postal    VARCHAR(20)  NOT NULL,
  fecha_nacimiento DATE NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clientes_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_clientes_dni CHECK (dni <> '')              -- evita DNIs vacíos
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------
-- Tabla: administradores
-- Perfil de administrador/staff. 1:1 con usuarios.
-- ----------------------------------------------------------------------
CREATE TABLE administradores (
  id_admin         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  id_usuario       INT UNSIGNED NOT NULL UNIQUE,             -- FK a usuarios, relación 1:1
  dni              VARCHAR(20) NOT NULL UNIQUE,              -- DNI único
  nombre           VARCHAR(100) NOT NULL,
  apellido         VARCHAR(100) NOT NULL,
  telefono         VARCHAR(25)  NULL,
  cargo            VARCHAR(100) NOT NULL,                    -- rol interno: encargado, vendedor, etc.
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admins_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_admins_dni CHECK (dni <> '')                -- evita DNIs vacíos
) ENGINE=InnoDB;


/* ======================================================================
   2) CATÁLOGO
   ----------------------------------------------------------------------
   Propósito del módulo:
   - Estructura de categorías, productos, variantes y sus imágenes.
   - Soporta categoría principal y múltiples categorías secundarias
     por producto (tabla de unión).
   ====================================================================== */

-- ----------------------------------------------------------------------
-- Tabla: categorias
-- Agrupa productos por rubro o clasificación.
-- ----------------------------------------------------------------------
CREATE TABLE categorias (
  id_categoria     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  nombre_categoria VARCHAR(120) NOT NULL UNIQUE,             -- nombre único
  descripcion      VARCHAR(300) NULL,                        -- breve descripción
  estado           ENUM('activa','inactiva') NOT NULL DEFAULT 'activa',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------
-- Tabla: productos
-- Ítems del catálogo con su categoría principal y estado.
-- ----------------------------------------------------------------------
CREATE TABLE productos (
  id_producto      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  nombre           VARCHAR(200) NOT NULL,                    -- nombre comercial
  descripcion      TEXT NULL,                                -- descripción extendida
  precio_base      DECIMAL(12,2) NOT NULL,                   -- precio base (sin/según IVA)
  stock            INT UNSIGNED NOT NULL DEFAULT 0,          -- stock global (sin variantes)
  iva_porcentaje   DECIMAL(5,2) NOT NULL DEFAULT 21.00 COMMENT 'Porcentaje de IVA aplicado al producto',
  stock_minimo     INT UNSIGNED NOT NULL DEFAULT 5 COMMENT 'Stock mínimo antes de mostrar alerta o detener venta',
  id_categoria     INT UNSIGNED NOT NULL,                    -- categoría principal (FK)
  estado           ENUM('activo','inactivo','descontinuado') NOT NULL DEFAULT 'activo',
  fecha_alta       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- alta en catálogo
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_productos_categoria
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_precio_base_nonneg CHECK (precio_base >= 0), -- precio no negativo
  CONSTRAINT chk_stock_nonneg CHECK (stock >= 0)               -- stock no negativo
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------
-- Tabla: productos_categorias
-- Relación N:M entre productos y categorías secundarias.
-- ----------------------------------------------------------------------
CREATE TABLE productos_categorias (
  id_producto      INT UNSIGNED NOT NULL,                    -- FK producto
  id_categoria     INT UNSIGNED NOT NULL,                    -- FK categoría
  PRIMARY KEY (id_producto, id_categoria),
  CONSTRAINT fk_pc_producto
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pc_categoria
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------
-- Tabla: variantes_producto
-- Variantes de un producto (atributo/valor), con precio/stock opcionales.
-- ----------------------------------------------------------------------
CREATE TABLE variantes_producto (
  id_variante      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  id_producto      INT UNSIGNED NOT NULL,                    -- FK al producto
  atributo         VARCHAR(80)  NOT NULL,                    -- p.ej. "RAM", "Color"
  valor            VARCHAR(120) NOT NULL,                    -- p.ej. "16GB", "Negro"
  precio           DECIMAL(12,2) NULL,                       -- si NULL => usar precio_base
  stock            INT UNSIGNED NOT NULL DEFAULT 0,          -- stock específico
  sku              VARCHAR(60)  NULL UNIQUE,                 -- identificador logístico
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_var_producto
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_var_stock_nonneg CHECK (stock >= 0),
  CONSTRAINT chk_var_precio_nonneg CHECK (precio IS NULL OR precio >= 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------
-- Tabla: imagenes_productos
-- Galería de imágenes por producto/variante (ordenable).
-- ----------------------------------------------------------------------
CREATE TABLE imagenes_productos (
  id_imagen        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  id_producto      INT UNSIGNED NOT NULL,                    -- FK al producto
  id_variante      INT UNSIGNED NULL,                        -- FK a variante (opcional)
  url_imagen       VARCHAR(500) NOT NULL,                    -- URL/ubicación de la imagen
  posicion         INT UNSIGNED NOT NULL DEFAULT 1,          -- orden de visualización
  alt_text         VARCHAR(200) NULL,                        -- texto alternativo (accesibilidad/SEO)
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_img_producto
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_img_variante
    FOREIGN KEY (id_variante) REFERENCES variantes_producto(id_variante)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Índices de soporte para imágenes
CREATE INDEX idx_imagenes_prod_pos ON imagenes_productos(id_producto, posicion);
CREATE UNIQUE INDEX uq_imagen_prod_var_url ON imagenes_productos(id_producto, id_variante, url_imagen);


/* ======================================================================
   3) CARRITO
   ----------------------------------------------------------------------
   Propósito del módulo:
   - 1 carrito activo por usuario (validar en la app o por trigger).
   - Detalles del carrito (productos/variantes, cantidades y precio).
   ====================================================================== */

-- ----------------------------------------------------------------------
-- Tabla: carrito
-- Representa el carrito del usuario (estado: activo/comprado/cancelado).
-- ----------------------------------------------------------------------
CREATE TABLE carrito (
  id_carrito       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  id_usuario       INT UNSIGNED NOT NULL,                    -- propietario del carrito
  fecha_creacion   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado           ENUM('activo','comprado','cancelado') NOT NULL DEFAULT 'activo',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carrito_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Apoyo a consultas de "carrito activo por usuario"
CREATE INDEX idx_carrito_usuario_estado ON carrito(id_usuario, estado);

-- ----------------------------------------------------------------------
-- Tabla: carrito_detalle
-- Ítems agregados al carrito + reglas de unicidad por producto/variante.
-- ----------------------------------------------------------------------
-- ----------------------------------------------------------------------
-- Tabla: carrito_detalle
-- Ítems agregados al carrito + reglas de unicidad por producto/variante.
-- Incluye IVA directamente (sin necesidad de ALTER posterior).
-- ----------------------------------------------------------------------
CREATE TABLE carrito_detalle (
  id_detalle       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  id_carrito       INT UNSIGNED NOT NULL,                    -- FK al carrito
  id_producto      INT UNSIGNED NOT NULL,                    -- FK al producto
  id_variante      INT UNSIGNED NULL,                        -- FK a variante (opcional)
  cantidad         INT UNSIGNED NOT NULL DEFAULT 1,          -- unidades
  precio_unitario  DECIMAL(12,2) NOT NULL,                   -- precio unitario al momento
  iva_porcentaje   DECIMAL(5,2) NOT NULL DEFAULT 21.00 COMMENT 'Porcentaje de IVA aplicado al producto en el carrito',
  iva_monto        DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Monto de IVA incluido en el precio_unitario',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cd_carrito
    FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cd_producto
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cd_variante
    FOREIGN KEY (id_variante) REFERENCES variantes_producto(id_variante)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_cd_cantidad_pos CHECK (cantidad > 0),       -- cantidad positiva
  CONSTRAINT chk_cd_precio_nonneg CHECK (precio_unitario >= 0), -- precio no negativo
  -- Evita duplicados por línea: producto+variante dentro del mismo carrito
  UNIQUE KEY uq_cd_unique_line (id_carrito, id_producto, id_variante)
) ENGINE=InnoDB;

/* ======================================================================
   4) PEDIDOS, DETALLE, PAGOS, FACTURAS, ENVÍOS
   ----------------------------------------------------------------------
   Propósito del módulo:
   - Registrar compras (pedido y detalle), pagos asociados,
     facturación y logística de envíos.
   ====================================================================== */

-- ----------------------------------------------------------------------
-- Tabla: pedidos
-- Orden de compra del usuario con totales, estados y entrega.
-- ----------------------------------------------------------------------
CREATE TABLE pedidos (
  id_pedido              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- PK técnica
  id_usuario             INT UNSIGNED NOT NULL,                   -- comprador
  fecha_pedido           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal               DECIMAL(12,2) NOT NULL DEFAULT 0.00,     -- suma de líneas sin descuentos
  descuento_total        DECIMAL(12,2) NOT NULL DEFAULT 0.00,     -- descuentos acumulados
  costo_envio            DECIMAL(12,2) NOT NULL DEFAULT 0.00,     -- flete
  total                  DECIMAL(12,2) NOT NULL,                  -- subtotal - descuentos + envío
  estado                 ENUM('pendiente','pagado','enviado','entregado','cancelado','reembolsado') NOT NULL DEFAULT 'pendiente',
  metodo_entrega         ENUM('retiro','envio_domicilio') NOT NULL DEFAULT 'envio_domicilio',
  fecha_estimada_entrega DATE NULL,                                -- ETA opcional
  notas                  VARCHAR(500) NULL,                        -- observaciones internas
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedidos_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_total_nonneg CHECK (total >= 0),
  CONSTRAINT chk_descuento_nonneg CHECK (descuento_total >= 0),
  CONSTRAINT chk_envio_nonneg CHECK (costo_envio >= 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------
-- Tabla: pedido_detalle
-- Líneas del pedido con producto/variante, cantidades, precios e IVA.
-- ----------------------------------------------------------------------
CREATE TABLE pedido_detalle (
  id_detalle       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  id_pedido        INT UNSIGNED NOT NULL,                    -- FK al pedido
  id_producto      INT UNSIGNED NOT NULL,                    -- FK al producto
  id_variante      INT UNSIGNED NULL,                        -- FK a variante (opcional)
  cantidad         INT UNSIGNED NOT NULL,                    -- unidades
  precio_unitario  DECIMAL(12,2) NOT NULL,                   -- precio unitario de la línea
  iva_porcentaje   DECIMAL(5,2) NOT NULL DEFAULT 21.00 COMMENT 'IVA aplicado al producto en el momento del pedido',
  iva_monto        DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Monto de IVA incluido en el precio_unitario',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pd_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pd_producto
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pd_variante
    FOREIGN KEY (id_variante) REFERENCES variantes_producto(id_variante)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_pd_cantidad_pos CHECK (cantidad > 0),
  CONSTRAINT chk_pd_precio_nonneg CHECK (precio_unitario >= 0)
) ENGINE=InnoDB;

-- Índice por pedido para velocidad de lectura
CREATE INDEX idx_pd_pedido ON pedido_detalle(id_pedido);

-- Unicidad por línea (admite NULL en variante usando COALESCE)
CREATE UNIQUE INDEX uq_pd_unique_line
ON pedido_detalle (id_pedido, id_producto, (COALESCE(id_variante,0)));

-- ----------------------------------------------------------------------
-- Tabla: pagos
-- Registro del pago (1:1 con pedido en este diseño) y su estado.
-- ----------------------------------------------------------------------
CREATE TABLE pagos (
  id_pago          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  id_pedido        INT UNSIGNED NOT NULL UNIQUE,             -- 1 pago final por pedido
  metodo_pago      ENUM('mercado_pago','transferencia','tarjeta','otros') NOT NULL DEFAULT 'mercado_pago',
  estado_pago      ENUM('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente',
  id_transaccion   VARCHAR(120) NULL UNIQUE,                 -- ID del gateway (MP, etc.)
  monto            DECIMAL(12,2) NOT NULL,                   -- importe abonado
  fecha_pago       DATETIME NULL,                            -- fecha/hora del pago
  raw_gateway_json JSON NULL,                                -- respuesta completa del gateway
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pagos_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_pago_monto_nonneg CHECK (monto >= 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------
-- Tabla: facturas
-- Comprobantes fiscales relacionados al pedido/pago/usuario.
-- ----------------------------------------------------------------------
CREATE TABLE facturas (
  id_factura        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- PK técnica
  numero_factura    VARCHAR(30) NOT NULL UNIQUE,             -- Ej: "F0001-00001234"
  id_pedido         INT UNSIGNED NOT NULL,                   -- FK al pedido
  id_pago           INT UNSIGNED NULL,                       -- FK al pago (si fue aprobado)
  id_usuario        INT UNSIGNED NOT NULL,                   -- FK al cliente (emisor destino)
  tipo              ENUM('A','B','C') NOT NULL DEFAULT 'B',  -- tipo de factura
  fecha_emision     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal          DECIMAL(12,2) NOT NULL,
  iva_total         DECIMAL(12,2) NOT NULL,
  total             DECIMAL(12,2) NOT NULL,
  pdf_url           VARCHAR(500) NULL,                       -- link al PDF generado
  enviado_email     BOOLEAN NOT NULL DEFAULT 0,              -- 1 si fue enviado por correo
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_factura_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_factura_pago
    FOREIGN KEY (id_pago) REFERENCES pagos(id_pago)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_factura_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------
-- Tabla: envios
-- Datos logísticos del envío asociado a un pedido.
-- ----------------------------------------------------------------------
CREATE TABLE envios (
  id_envio           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- PK técnica
  id_pedido          INT UNSIGNED NOT NULL UNIQUE,            -- 1 registro por pedido
  destinatario       VARCHAR(200) NULL,                       -- si difiere del cliente
  direccion_envio    VARCHAR(255) NOT NULL,
  ciudad             VARCHAR(100) NOT NULL,
  provincia          VARCHAR(100) NOT NULL,
  pais               VARCHAR(100) NOT NULL DEFAULT 'Argentina',
  codigo_postal      VARCHAR(20)  NOT NULL,
  empresa_envio      VARCHAR(120) NULL,                       -- p.ej. Andreani
  numero_seguimiento VARCHAR(120) NULL,                       -- tracking
  estado_envio       ENUM('preparando','en_camino','entregado','devuelto') NOT NULL DEFAULT 'preparando',
  fecha_envio        DATETIME NULL,
  fecha_entrega      DATETIME NULL,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_envios_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


/* ======================================================================
   5) DESCUENTOS, SOPORTE, LOGS, HISTORIAL
   ----------------------------------------------------------------------
   Propósito del módulo:
   - Cupones/discounts, tickets de soporte,
     auditoría básica y cambios de estado de pedidos.
   ====================================================================== */

-- ----------------------------------------------------------------------
-- Tabla: descuentos
-- Cupones o reglas de descuento con rango de validez y estado.
-- ----------------------------------------------------------------------
CREATE TABLE descuentos (
  id_descuento     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  codigo           VARCHAR(60) NOT NULL UNIQUE,              -- código/cupón
  descripcion      VARCHAR(255) NULL,                        -- explicación
  tipo             ENUM('porcentaje','monto','envio_gratis') NOT NULL,
  valor            DECIMAL(12,2) NOT NULL DEFAULT 0.00,      -- % o monto
  fecha_inicio     DATETIME NOT NULL,                        -- vigencia desde
  fecha_fin        DATETIME NOT NULL,                        -- vigencia hasta
  estado           ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_desc_valor_nonneg CHECK (valor >= 0),
  CONSTRAINT chk_desc_fechas CHECK (fecha_fin > fecha_inicio)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------
-- Tabla: pedidos_descuentos
-- Relación N:M entre pedidos y descuentos aplicados.
-- ----------------------------------------------------------------------
CREATE TABLE pedidos_descuentos (
  id_pedido        INT UNSIGNED NOT NULL,                    -- FK al pedido
  id_descuento     INT UNSIGNED NOT NULL,                    -- FK al descuento
  monto_aplicado   DECIMAL(12,2) NOT NULL DEFAULT 0.00,      -- valor aplicado
  PRIMARY KEY (id_pedido, id_descuento),
  CONSTRAINT fk_pdsc_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pdsc_desc
    FOREIGN KEY (id_descuento) REFERENCES descuentos(id_descuento)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------
-- Tabla: soporte
-- Tickets/contactos de usuarios por canales: email/whatsapp/web.
-- ----------------------------------------------------------------------
CREATE TABLE soporte (
  id_soporte       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- PK técnica
  id_usuario       INT UNSIGNED NOT NULL,                    -- autor del ticket
  asunto           VARCHAR(200) NOT NULL,                    -- título
  mensaje          TEXT NOT NULL,                            -- cuerpo del ticket
  canal            ENUM('email','whatsapp','web') NOT NULL DEFAULT 'web',
  estado           ENUM('pendiente','respondido','cerrado') NOT NULL DEFAULT 'pendiente',
  fecha_creacion   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  respuesta        TEXT NULL,                                -- respuesta del staff
  fecha_respuesta  DATETIME NULL,
  CONSTRAINT fk_soporte_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------
-- Tabla: logs
-- Auditoría básica de acciones de usuarios/sistema.
-- ----------------------------------------------------------------------
CREATE TABLE logs (
  id_log           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- PK técnica
  id_usuario       INT UNSIGNED NULL,                          -- puede ser NULL si es acción del sistema
  accion           VARCHAR(255) NOT NULL,                      -- descripción de la acción
  fecha_hora       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip               VARCHAR(45)  NULL,                          -- IPv4/IPv6
  user_agent       VARCHAR(255) NULL,                          -- navegador/cliente
  CONSTRAINT fk_logs_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------
-- Tabla: historial_pedidos
-- Trazabilidad de cambios de estado en pedidos (auditoría).
-- ----------------------------------------------------------------------
CREATE TABLE historial_pedidos (
  id_historial INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,       -- PK técnica
  id_pedido INT UNSIGNED NOT NULL,                            -- FK al pedido
  estado_anterior ENUM('pendiente','pagado','enviado','entregado','cancelado','reembolsado'),
  estado_nuevo    ENUM('pendiente','pagado','enviado','entregado','cancelado','reembolsado'),
  fecha_cambio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- cuándo cambió
  id_usuario INT UNSIGNED NULL,                               -- quién realizó el cambio (puede ser NULL)
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);


/* ======================================================================
   6) ÍNDICES ADICIONALES (OPTIMIZACIÓN DE CONSULTAS)
   ----------------------------------------------------------------------
   Propósito del módulo:
   - Acelerar consultas frecuentes sin modificar la lógica de negocio.
   ====================================================================== */

CREATE INDEX idx_prod_nombre            ON productos(nombre);
CREATE INDEX idx_var_prod_attr_val      ON variantes_producto(id_producto, atributo, valor);
CREATE INDEX idx_carrito_user           ON carrito(id_usuario);
CREATE INDEX idx_pedidos_user_fecha     ON pedidos(id_usuario, fecha_pedido);
CREATE INDEX idx_envios_estado          ON envios(estado_envio);
CREATE INDEX idx_soporte_estado         ON soporte(estado);