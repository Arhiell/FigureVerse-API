-- ======================================================================
-- BASE DE DATOS: FigureVerse - Tienda Online de Figuras de Acción y Anime
-- Desarrollada para el proyecto conjunto de Ariel & Bautista
-- ======================================================================

-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS figureverse
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE figureverse;

-- ======================================================================
-- 1 USUARIOS Y PERFILES
-- ======================================================================

-- Tabla principal de usuarios: contiene tanto clientes como administradores.
CREATE TABLE usuarios (
  id_usuario       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,           -- Identificador único
  nombre_usuario   VARCHAR(100) NOT NULL UNIQUE,                      -- Nombre de usuario visible
  email            VARCHAR(150) NOT NULL UNIQUE,                      -- Correo electrónico
  password_hash    VARCHAR(255) NOT NULL,                             -- Contraseña cifrada (bcrypt)
  rol              ENUM('cliente','admin','super_admin') NOT NULL DEFAULT 'cliente',-- Rol del usuario dentro del sistema
  estado           ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',-- Estado general de la cuenta
  avatar_url       VARCHAR(255) NULL,                                 -- Imagen de perfil (opcional)
  fecha_registro   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,       -- Fecha de alta
  ultimo_login     DATETIME NULL,                                     -- Último acceso registrado
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,       -- Fecha de creación (auditoría)
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Usuarios registrados en FigureVerse (clientes y administradores).';

-- Tabla de clientes: perfil extendido con información de envío y datos personales.
CREATE TABLE clientes (
  id_cliente       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,           -- Identificador único
  id_usuario       INT UNSIGNED NOT NULL UNIQUE,                      -- Relación 1:1 con usuarios
  nombre           VARCHAR(100) NOT NULL,                             -- Nombre real
  apellido         VARCHAR(100) NOT NULL,                             -- Apellido
  dni              VARCHAR(20) NOT NULL UNIQUE,                       -- Documento del cliente
  telefono         VARCHAR(25) NULL,                                  -- Teléfono de contacto
  direccion        VARCHAR(255) NOT NULL,                             -- Dirección principal
  numero           VARCHAR(10)  NULL,                                 -- Número de la casa (opcional)
  piso             VARCHAR(10)  NULL,                                 -- Piso (opcional)
  departamento     VARCHAR(10)  NULL,                                 -- Dpto (opcional)
  referencia       VARCHAR(255) NULL,                               -- Referencia adicional (ej: "Frente a la plaza")
  ciudad           VARCHAR(100) NOT NULL,                             -- Ciudad
  provincia        VARCHAR(100) NOT NULL,                             -- Provincia o estado
  pais             VARCHAR(100) NOT NULL DEFAULT 'Argentina',         -- País
  codigo_postal    VARCHAR(20) NOT NULL,                              -- Código postal
  fecha_nacimiento DATE NULL,                                         -- Fecha de nacimiento (opcional)
  preferencias     TEXT NULL,                                         -- Intereses (ej. universos, marcas favoritas)
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clientes_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Datos personales y preferencias de los clientes.';

-- Tabla de administradores: datos de personal con acceso a gestión.
CREATE TABLE administradores (
  id_admin         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario       INT UNSIGNED NOT NULL UNIQUE,
  nombre           VARCHAR(100) NOT NULL,
  apellido         VARCHAR(100) NOT NULL,
  dni              VARCHAR(20) NOT NULL UNIQUE,
  telefono         VARCHAR(25) NULL,
  cargo            VARCHAR(100) NOT NULL, 
  area             ENUM('ventas','inventario','marketing','soporte','otro') DEFAULT 'otro',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admins_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Administradores y personal interno de FigureVerse.';

-- ======================================================================
-- 2 CATÁLOGO DE PRODUCTOS Y COLECCIONES
-- ======================================================================

-- Tabla de universos: agrupa franquicias o mundos (Marvel, DC, Anime, etc.)
CREATE TABLE universos (
  id_universo      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(100) NOT NULL UNIQUE,
  descripcion      VARCHAR(255) NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Franquicias o universos temáticos (Marvel, DC, Anime, etc.).';

-- Tabla de fabricantes: empresas productoras de figuras.
CREATE TABLE fabricantes (
  id_fabricante    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(120) NOT NULL UNIQUE,
  pais_origen      VARCHAR(100) NULL,
  sitio_web        VARCHAR(200) NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Fabricantes oficiales de figuras (Bandai, Funko, Kotobukiya, etc.).';

-- Tabla de categorías: organiza los productos según tipo o material.
CREATE TABLE categorias (
  id_categoria     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_categoria VARCHAR(120) NOT NULL UNIQUE,   -- Ej: Figuras PVC, Escala 1/6, Manga, Funko Pop
  descripcion      VARCHAR(300) NULL,
  estado           ENUM('activa','inactiva') NOT NULL DEFAULT 'activa',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Categorías generales de productos.';

-- Tabla de productos: núcleo del catálogo de FigureVerse.
CREATE TABLE productos (
  id_producto      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(200) NOT NULL,                           -- Nombre completo de la figura
  descripcion      TEXT NULL,                                       -- Descripción detallada
  precio_base      DECIMAL(12,2) NOT NULL,                          -- Precio base sin IVA
  stock            INT UNSIGNED NOT NULL DEFAULT 0,                 -- Stock disponible
  stock_minimo     INT UNSIGNED NOT NULL DEFAULT 5,                 -- Umbral de alerta
  iva_porcentaje   DECIMAL(5,2) NOT NULL DEFAULT 21.00,             -- IVA aplicado
  id_categoria     INT UNSIGNED NOT NULL,                           -- Categoría
  id_universo      INT UNSIGNED NULL,                               -- Universo (Marvel, Anime, etc.)
  id_fabricante    INT UNSIGNED NULL,                               -- Fabricante
  anio_lanzamiento YEAR NULL,                                       -- Año de lanzamiento del producto
  escala           VARCHAR(20) NULL,                                -- Escala de la figura (1/6, 1/12, etc.)
  estado           ENUM('activo','inactivo','edicion_limitada','agotado') NOT NULL DEFAULT 'activo',
  fecha_alta       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_prod_cat FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
  CONSTRAINT fk_prod_uni FOREIGN KEY (id_universo) REFERENCES universos(id_universo),
  CONSTRAINT fk_prod_fab FOREIGN KEY (id_fabricante) REFERENCES fabricantes(id_fabricante),
  CONSTRAINT chk_precio_nonneg CHECK (precio_base >= 0),
  CONSTRAINT chk_stock_nonneg CHECK (stock >= 0)
) ENGINE=InnoDB COMMENT='Productos disponibles en la tienda (figuras, cómics, coleccionables).';

-- Tabla de variantes: define ediciones especiales o colores alternativos.
CREATE TABLE variantes_producto (
  id_variante   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_producto   INT UNSIGNED NOT NULL,
  atributo      VARCHAR(80)  NOT NULL,             -- Ej: Color, Versión, Tamaño
  valor         VARCHAR(120) NOT NULL,             -- Ej: Rojo, Deluxe, 20cm
  precio        DECIMAL(12,2) NULL,                -- Precio alternativo si varía
  stock         INT UNSIGNED NOT NULL DEFAULT 0,   -- Stock individual
  sku           VARCHAR(60) NULL UNIQUE,           -- Identificador interno
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Variantes o versiones especiales de cada figura.';

-- Tabla de imágenes de productos y variantes.
CREATE TABLE imagenes_productos (
  id_imagen      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_producto    INT UNSIGNED NOT NULL,
  id_variante    INT UNSIGNED NULL,
  url_imagen     VARCHAR(500) NOT NULL,            -- URL pública (bucket/CDN)
  posicion       INT UNSIGNED NOT NULL DEFAULT 1,  -- Orden en galería
  alt_text       VARCHAR(200) NULL,                -- Descripción accesible
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_variante) REFERENCES variantes_producto(id_variante)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Imágenes asociadas a productos o variantes.';

CREATE INDEX idx_img_prod_pos ON imagenes_productos(id_producto, posicion);

-- ======================================================================
-- 3 CARRITO DE COMPRAS
-- ======================================================================

CREATE TABLE carrito (
  id_carrito     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario     INT UNSIGNED NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado         ENUM('activo','comprado','cancelado') NOT NULL DEFAULT 'activo',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Carrito de compras por usuario.';

CREATE TABLE carrito_detalle (
  id_detalle      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_carrito      INT UNSIGNED NOT NULL,
  id_producto     INT UNSIGNED NOT NULL,
  id_variante     INT UNSIGNED NULL,
  cantidad        INT UNSIGNED NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL,
  iva_porcentaje  DECIMAL(5,2) NOT NULL DEFAULT 21.00,
  iva_monto       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (id_variante) REFERENCES variantes_producto(id_variante)
    ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY uq_cart_item (id_carrito, id_producto, id_variante)
) ENGINE=InnoDB COMMENT='Detalle de los productos agregados al carrito.';

-- ======================================================================
-- 4 PEDIDOS, PAGOS Y ENVÍOS
-- ======================================================================

CREATE TABLE pedidos (
  id_pedido              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario             INT UNSIGNED NOT NULL,
  fecha_pedido           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal               DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  descuento_total        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  costo_envio            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total                  DECIMAL(12,2) NOT NULL,
  estado                 ENUM('pendiente','pagado','enviado','entregado','cancelado','reembolsado') DEFAULT 'pendiente',
  metodo_entrega         ENUM('retiro','envio_domicilio') DEFAULT 'envio_domicilio',
  fecha_estimada_entrega DATE NULL,
  notas                  VARCHAR(500) NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB COMMENT='Pedidos generados por los clientes.';

CREATE TABLE pedido_detalle (
  id_detalle       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido        INT UNSIGNED NOT NULL,
  id_producto      INT UNSIGNED NOT NULL,
  id_variante      INT UNSIGNED NULL,
  cantidad         INT UNSIGNED NOT NULL,
  precio_unitario  DECIMAL(12,2) NOT NULL,
  iva_porcentaje   DECIMAL(5,2) NOT NULL DEFAULT 21.00,
  iva_monto        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
  FOREIGN KEY (id_variante) REFERENCES variantes_producto(id_variante)
) ENGINE=InnoDB COMMENT='Detalle de los productos incluidos en cada pedido.';

-- Tabla historial_pedidos: conserva los cambios de estado de cada pedido.
CREATE TABLE historial_pedidos (
  id_historial     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido        INT UNSIGNED NOT NULL,
  estado_anterior  ENUM('pendiente','pagado','enviado','entregado','cancelado','reembolsado') NULL,
  estado_nuevo     ENUM('pendiente','pagado','enviado','entregado','cancelado','reembolsado') NOT NULL,
  fecha_cambio     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario       INT UNSIGNED NULL,                                -- Usuario o admin que efectuó el cambio
  comentario       VARCHAR(255) NULL,                                -- Observación opcional
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Registro histórico de cambios de estado en los pedidos.';

CREATE TABLE pagos (
  id_pago        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido      INT UNSIGNED NOT NULL UNIQUE,
  metodo_pago    ENUM('mercado_pago','transferencia','tarjeta','efectivo') DEFAULT 'mercado_pago',
  estado_pago    ENUM('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  id_transaccion VARCHAR(120) NULL UNIQUE,
  monto          DECIMAL(12,2) NOT NULL,
  fecha_pago     DATETIME NULL,
  raw_gateway_json JSON NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Pagos registrados por pedido (vía Mercado Pago u otros métodos).';

CREATE TABLE envios (
  id_envio          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido         INT UNSIGNED NOT NULL UNIQUE,
  destinatario      VARCHAR(200) NULL,
  direccion_envio   VARCHAR(255) NOT NULL,
  ciudad            VARCHAR(100) NOT NULL,
  provincia         VARCHAR(100) NOT NULL,
  pais              VARCHAR(100) NOT NULL DEFAULT 'Argentina',
  codigo_postal     VARCHAR(20) NOT NULL,
  empresa_envio     VARCHAR(120) NULL,
  numero_seguimiento VARCHAR(120) NULL,
  estado_envio      ENUM('preparando','en_camino','entregado','devuelto') DEFAULT 'preparando',
  fecha_envio       DATETIME NULL,
  fecha_entrega     DATETIME NULL,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Información de envíos y seguimiento de pedidos.';

-- ======================================================================
-- 5 DESCUENTOS
-- ======================================================================

CREATE TABLE descuentos (
  id_descuento  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo        VARCHAR(60) NOT NULL UNIQUE,
  descripcion   VARCHAR(255) NULL,
  tipo          ENUM('porcentaje','monto','envio_gratis') DEFAULT 'porcentaje',
  valor         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  fecha_inicio  DATETIME NOT NULL,
  fecha_fin     DATETIME NOT NULL,
  estado        ENUM('activo','inactivo') DEFAULT 'activo',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Cupones o promociones aplicables a los pedidos.';

CREATE TABLE pedidos_descuentos (
  id_pedido      INT UNSIGNED NOT NULL,
  id_descuento   INT UNSIGNED NOT NULL,
  monto_aplicado DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id_pedido, id_descuento),
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (id_descuento) REFERENCES descuentos(id_descuento)
) ENGINE=InnoDB COMMENT='Relación entre pedidos y descuentos aplicados.';

-- ======================================================================
-- 6 FACTURAS Y ENVÍO DE FACTURAS
-- ======================================================================

-- Tabla principal de facturas: documento fiscal generado tras un pago aprobado.
CREATE TABLE facturas (
  id_factura          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido           INT UNSIGNED NOT NULL UNIQUE,                  -- Relación 1:1 con pedido
  numero_factura      VARCHAR(50) NOT NULL UNIQUE,                   -- Ejemplo: FV-2025-000123
  tipo_factura        ENUM('A','B','C') NOT NULL DEFAULT 'B',        -- Tipo según régimen fiscal
  fecha_emision       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- Fecha/hora de emisión
  subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  iva_monto           DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total               DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  metodo_pago         ENUM('mercado_pago','transferencia','tarjeta','efectivo') DEFAULT 'mercado_pago',
  estado_factura      ENUM('emitida','enviada','descargada','anulada') DEFAULT 'emitida',
  url_pdf             VARCHAR(500) NULL,                             -- URL pública o ruta al archivo PDF
  hash_verificacion   CHAR(64) NOT NULL,                             -- SHA-256 para verificar integridad
  observaciones       VARCHAR(255) NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Facturas generadas para los pedidos pagados, con enlace al PDF descargable.';

-- Tabla de envío de facturas: registra el envío automático por correo electrónico.
CREATE TABLE envio_facturas (
  id_envio_factura    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_factura          INT UNSIGNED NOT NULL,
  email_destinatario  VARCHAR(150) NOT NULL,                         -- Correo del cliente
  asunto              VARCHAR(200) DEFAULT 'Tu factura de compra FigureVerse',
  cuerpo_mensaje      TEXT NULL,                                     -- Mensaje personalizado o plantilla
  estado_envio        ENUM('pendiente','enviado','error') DEFAULT 'pendiente',
  fecha_envio         DATETIME NULL,
  intento             TINYINT UNSIGNED NOT NULL DEFAULT 0,           -- Intentos de envío
  error_mensaje       VARCHAR(255) NULL,                             -- Descripción del error si ocurre
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_factura) REFERENCES facturas(id_factura)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Historial de envíos de facturas al correo electrónico del cliente.';

-- ======================================================================
-- 7 ÍNDICES ADICIONALES PARA RENDIMIENTO
-- ======================================================================

-- Índices útiles para mejorar las búsquedas frecuentes.
CREATE INDEX idx_usuarios_nombre        ON usuarios(nombre_usuario);
CREATE INDEX idx_clientes_apellido      ON clientes(apellido);
CREATE INDEX idx_productos_nombre       ON productos(nombre);
CREATE INDEX idx_variante_producto      ON variantes_producto(id_producto);
CREATE INDEX idx_carrito_usuario        ON carrito(id_usuario);
CREATE INDEX idx_pedidos_usuario_fecha  ON pedidos(id_usuario, fecha_pedido);
CREATE INDEX idx_envios_estado          ON envios(estado_envio);
CREATE INDEX idx_resenas_producto       ON resenas(id_producto);
CREATE INDEX idx_soporte_estado         ON soporte(estado);

-- ======================================================================
-- BASE DE DATOS FigureVerse FINALIZADA
-- ======================================================================

-- Contiene:
--  • Usuarios y roles (clientes, administradores)
--  • Catálogo extendido (universos, fabricantes, licencias, categorías, productos y variantes)
--  • Gestión de ventas (carrito, pedidos, pagos, envíos)
--  • Valoraciones y descuentos
--  • Sistema de soporte y seguimiento histórico
--  • Índices de rendimiento listos para producción

