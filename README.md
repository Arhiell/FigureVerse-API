# 🧩 FigureVerse API

API para gestionar productos de cómic, manga, figuras y coleccionables. Diseñada para rendimiento y claridad, con módulos de catálogo, carrito, pedidos, pagos, envíos, reseñas, soporte y administración.

## 🌟 Descripción breve

- Base path: `http://localhost:3000`
- Ruta de salud: `GET /`
- Punto de entrada: `feraytek-api-main/src/server.js`

## 🔗 Repositorios del ecosistema

- Web (catálogo y compras): https://github.com/Arhiell/FigureVerse_Web
- Escritorio (gestión administrativa): https://github.com/BautiC-9/FigureVerse-Escritorio
- API Python (Cloud Functions + Gemini): https://github.com/Arhiell/FigureVerse_API_Python

## 🧰 Tecnologías

- Node.js + Express (`feraytek-api-main/src/app.js`)
- MySQL (`mysql2`) con configuración en `src/config/database.js`
- JWT para autenticación (`src/middleware/auth.js`)
- Mercado Pago (`src/services/pago.service.js`)
- Firebase Admin (si aplica) `firebase.json`, `functions/`

## 🧱 Requisitos

- Node.js 18+
- MySQL 8.x (o compatible)
- Cuenta de Mercado Pago (Sandbox)
- Opcional: Firebase CLI

## ⚙️ Instalación

1. Clonar el repositorio

```bash
git clone https://github.com/Arhiell/FigureVerse-API.git
cd FigureVerse-API
```

2. Instalar dependencias

```bash
npm install
```

## 🔑 Configuración (.env)

Copiar `feraytek-api-main/.env.example` a `feraytek-api-main/.env` y completar:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=***
DB_NAME=feraytek
DB_PORT=3306

# Mercado Pago (Sandbox)
MP_ACCESS_TOKEN=TEST
MP_PUBLIC_KEY=TEST
```

⚠️ No subir credenciales reales. Usa variables de entorno.

## 🏃 Ejecución

Punto de entrada: `feraytek-api-main/src/server.js`

```bash
npm run dev
```

Al iniciar: crea tablas de auditoría y password reset. Logs en consola.

## 📂 Estructura del proyecto

- `feraytek-api-main/src/app.js`: middlewares y registro de rutas
- `src/controllers/`: controladores HTTP
- `src/services/`: lógica de negocio
- `src/models/`: acceso a datos (MySQL)
- `src/routes/`: endpoints y paths base
- `src/middleware/`: auth, auditoría, validación, errores
- `functions/`: Firebase Functions y emuladores

## 🧭 Endpoints principales

- Usuarios: `/api/users` (registro, login, perfiles) — ejemplo: `GET /api/users/:id`
- Productos: `/api/productos` (listado, detalle) — ejemplo: `GET /api/productos/:id`
- Categorías: `/api/categorias`
- Imágenes: `/api/imagenes_productos`
- Reseñas: `/api/resenas`
- Carrito: `/api/carrito` (agregar, eliminar, vaciar, estadísticas admin)
- Pedidos: `/api/pedidos` (detalle con permisos)
- Pagos: `/api/pagos` (preferencias, estados, `POST /api/pagos/webhook`)
- Envíos: `/api/envios`
- Facturas: `/api/facturas`
- Admin: `/api/admin` y `/api/superadmin`
- Gestión de usuario: `/api/user-management`
- Autenticación y recuperación: `/api/auth`
- Descuentos: `/api/descuentos` • Variantes: `/api/variantes`
- Soporte: `/api/soporte`

Ruta raíz de salud: `GET /` → "8D API Feraytek - Servidor activo"

## 🔐 Autenticación y roles

JWT vía middleware (`src/middleware/auth.js`). Roles soportados: `cliente`, `admin`, `superadmin`.
Validación de permisos y propiedad en endpoints sensibles (ej. pedidos).

## 🌐 Integraciones

- Mercado Pago (sandbox) — webhook: `POST /api/pagos/webhook`
- Firebase Admin — emuladores según `firebase.json`

## 🗄️ Base de datos

MySQL con tablas para usuarios, productos, carritos, pedidos, envíos, reseñas, auditoría, etc.
Conexión en `src/config/database.js` y modelos en `src/models/`.

## 🧪 Scripts y datos

Semillas y utilidades en `src/scripts/` (`seed.js`, listado de productos, reseñas). Ejecuta con Node.

## 🧯 Seguridad

- No subir claves privadas ni tokens productivos. Usa `.env` y gestores seguros.
- Limitar CORS según origen en producción.
- Validar datos en `services/` y sanitizar entradas.

## 🔎 Ejemplos de uso

Obtener producto por ID:

```bash
curl http://localhost:3000/api/productos/123
```

## 📑 Documentación de endpoints (resumen estilo OpenAPI)

**Usuarios (`/api/users`)**

- `POST /login` — Inicia sesión. Body: `email`, `password`. Respuesta: token JWT.
- `POST /register` — Registro rápido de cliente. Body: datos de usuario.
- `POST /register/cliente` — Registro de cliente (detallado).
- `GET /profile` — Perfil del usuario autenticado. Auth: JWT.
- `PUT /profile` — Actualiza perfil del usuario autenticado. Auth: JWT.
- `PUT /password` — Cambia la contraseña del usuario autenticado. Auth: JWT.
- `GET /profile/:id` — Obtiene usuario por ID (owner o admin). Auth: JWT.
- `PUT /profile/cliente/:id` — Actualiza perfil cliente (owner o admin). Auth: JWT.
- `PUT /password/:id` — Cambia contraseña por ID (owner o admin). Auth: JWT.
- `GET /` — Lista usuarios (solo admin). Auth: JWT + rol admin.
- `POST /register/admin` — Crea admin (solo superadmin). Auth: JWT + rol superadmin.
- `PUT /:id` — Actualiza usuario (owner o admin). Auth: JWT.
- `PUT /profile/admin/:id` — Actualiza perfil admin (solo admin). Auth: JWT.
- `DELETE /:id` — Elimina usuario (solo admin). Auth: JWT.

**Productos (`/api/productos`)**

- `GET /` — Lista productos.
- `GET /:id` — Detalle de producto.
- `POST /` — Crea producto (admin). Auth: JWT + rol admin.
- `PUT /:id` — Actualiza producto (admin). Auth: JWT + rol admin.
- `DELETE /:id` — Elimina producto (admin). Auth: JWT + rol admin.
- `GET /:id/variantes` — Lista variantes del producto.
- `POST /:id/variantes` — Crea variante (admin). Auth: JWT + rol admin.
- `PUT /:id/variantes/:id_variante` — Actualiza variante (admin). Auth: JWT + rol admin.
- `DELETE /:id/variantes/:id_variante` — Elimina variante (admin). Auth: JWT + rol admin.

**Carrito (`/api/carrito`)**

- `GET /` — Lista ítems del carrito del usuario. Auth: JWT.
- `POST /` — Agrega ítem. Body: `id_producto`, `cantidad`. Auth: JWT.
- `DELETE /item` — Elimina ítem. Body: `id_producto`. Auth: JWT.
- `DELETE /` — Vacía carrito. Auth: JWT.
- `GET /admin/todos` — Lista carritos (admin). Auth: JWT + rol admin.
- `GET /admin/usuario/:id` — Carrito por usuario (admin). Auth: JWT + rol admin.
- `GET /admin/abandonados` — Carritos abandonados (admin). Auth: JWT + rol admin.
- `DELETE /admin/limpiar-abandonados` — Limpia abandonados (admin). Auth.
- `GET /admin/estadisticas` — Estadísticas (admin). Auth.

**Pedidos (`/api/pedidos`)**

- `GET /usuario` — Lista pedidos del usuario autenticado. Auth: JWT.
- `POST /` — Crea pedido desde carrito. Auth: JWT.
- `GET /` — Lista todos (admin). Auth: JWT + rol admin.
- `GET /:id` — Detalle del pedido del usuario (valida propietario o admin). Auth: JWT.
- `PUT /:id/estado` — Cambia estado (admin). Auth: JWT + rol admin.

**Pagos (`/api/pagos`)**

- `POST /` — Crea pago (cliente). Auth: JWT.
- `GET /` — Lista pagos (admin). Auth: JWT + rol admin.
- `GET /consulta` — Consulta pagos con filtros (cliente). Auth: JWT.
- `GET /:id` — Detalle de pago (owner o admin). Auth: JWT.
- `PUT /:id/estado` — Actualiza estado (admin). Auth: JWT + rol admin.
- `POST /webhook` — Webhook Mercado Pago (público para MP).
- `POST /simular-aprobacion/:id_transaccion` — Simulación (admin dev). Auth: JWT + rol admin.

**Envíos (`/api/envios`)**

- `GET /` — Lista envíos (admin). Auth: JWT + rol admin.
- `GET /:id` — Detalle (admin). Auth: JWT + rol admin.
- `POST /` — Crea envío (admin). Auth: JWT + rol admin.
- `POST /crear-para-existentes` — Genera envíos para pedidos existentes (admin). Auth.
- `PUT /:id` — Actualiza datos (admin). Auth.
- `PUT /:id/estado` — Cambia estado (admin). Auth.
- `DELETE /:id` — Elimina envío (admin). Auth.

**Soporte (`/api/soporte`)**

- `POST /` — Crea ticket (cliente). Auth: JWT.
- `GET /mis-tickets` — Lista mis tickets (cliente). Auth: JWT.
- `GET /estadisticas` — Estadísticas (admin). Auth: JWT + rol admin.
- `GET /` — Lista todos con filtros (admin). Auth.
- `GET /:id_soporte` — Detalle (owner o admin). Auth.
- `PUT /:id_soporte/responder` — Responder (admin). Auth.
- `PUT /:id_soporte/prioridad` — Actualizar prioridad (admin). Auth.
- `PUT /:id_soporte/cerrar` — Cerrar (admin). Auth.

## 🏫 Créditos

Universidad Tecnológica Nacional (UTN) – Facultad Regional Resistencia

Carrera: Técnico Universitario en Programación

Autores: [Ayala, Ariel](https://github.com/Arhiell) • [Capovilla, Bautista](https://github.com/BautiC-9)

Profesores: Python – Goya, Juan Manuel • JavaScript – Puljiz, Emilio
