<div align="center">

# FigureVerse API 🚀

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8%2B-4479A1?logo=mysql&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203-85EA2D?logo=swagger&logoColor=black)
![JWT](https://img.shields.io/badge/JWT-secure-000000?logo=jsonwebtokens&logoColor=white)
![MercadoPago](https://img.shields.io/badge/MercadoPago-SDK%20v2-00B1EA?logo=mercadopago&logoColor=white)

<br/>

**Tienda online de figuras, cómics y coleccionables — API REST**

🔗 Base URL: `http://localhost:3000`  •  📚 Docs: `http://localhost:3000/api-docs`  •   Health: `http://localhost:3000/health`

</div>

## Descripción

API diseñada para gestionar catálogo, usuarios, pedidos, pagos y facturación. Incluye autenticación JWT, integración con Mercado Pago (SDK v2), documentación Swagger y mejores prácticas de seguridad (Helmet, CORS, Rate Limit).

## Tecnologías principales 🧰

- Node.js, Express
- Base de datos: MySQL (`mysql2/promise`)
- Autenticación: JWT y Google OAuth
- Pagos: Mercado Pago (preferencias y webhook)
- Documentación: Swagger (OpenAPI 3)
- Seguridad: Helmet, Rate Limit, CORS

## Endpoints clave 📦

- Pagos (`/pagos`)
  - `GET /pagos` — Lista todos los pagos. Requiere rol `admin` o `super_admin`.
  - `GET /pagos/pendientes` — Lista pagos con estado `pendiente`. Requiere rol `admin` o `super_admin`.
  - `PATCH /pagos/{id}/estado` — Alias para actualizar estado manual de un pago.

- Facturación (`/facturas`)
  - `POST /facturas/emitir/{id_pedido}` — Emite factura para un pedido.
  - `GET /facturas/{id}` — Obtiene una factura por `id_factura`.
  - `GET /facturas/pedido/{id_pedido}` — Obtiene la factura asociada a un pedido.

- Órdenes y carrito
  - `/orders` — Gestión de pedidos (creación y consulta).
  - `/carrito` — Operaciones del carrito y su detalle.

- Catálogo
  - `/productos`, `/categorias`, `/fabricantes`, `/universos`, `/api/variantes`, `/api/imagenes`.

- Usuarios y autenticación
  - `/auth` — Login, registro y OAuth Google.
  - `/users` — Gestión de usuarios.

Consulta la especificación completa y ejemplos en Swagger: `http://localhost:3000/api-docs`.

## Autenticación y roles 🔐

- Esquema `bearerAuth` (JWT) configurado en Swagger.
- Endpoints administrativos (pagos/facturas) protegidos por roles: `admin`, `super_admin`.
- CORS controlado vía `CORS_ORIGIN` para el frontend.

## Configuración y ejecución ⚙️

1) Clona el repositorio y entra al proyecto.

2) Instala dependencias:

```
npm install
```

3) Crea el archivo `.env` desde el ejemplo y completa valores:

```
cp .env.example .env
```

4) Inicia el servidor:

```
node server.js
```

Servidor en `http://localhost:3000`.

## Variables de entorno 🌱

Del archivo `.env.example`:

- App: `NODE_ENV`, `PORT`
- MySQL: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- JWT: `JWT_SECRET`, `JWT_EXPIRES_IN`
- Email (SMTP): `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Rutas: `API_URL`
- CORS: `CORS_ORIGIN`
- Mercado Pago: `MERCADOPAGO_ACCESS_TOKEN`

## Documentación de la API 📖

- UI Swagger: `http://localhost:3000/api-docs`
- Esquemas y rutas escaneadas: `./src/routes/*.js` y `./src/models/*.js`
- Autenticación global: `bearerAuth` (JWT)

## Base de datos 🗄️

- Scripts SQL: `DDBB/DataBase.sql`, datos de ejemplo `DDBB/DatosEjemplo.sql`, pruebas `DDBB/Test.sql`.
- Conexión: `src/config/db.js` (`mysql2/promise`, `pool.query`).

## Estructura del proyecto 📁

```
src/
  app.js
  config/
  controllers/
  middlewares/
  models/
  routes/
  services/
server.js
```

## Autores 👤

- Capovilla Bautista — https://github.com/BautiC-9
- Ayala, Ariel — https://github.com/Arhiell

## Contribuciones 🤝

Las contribuciones son bienvenidas. Abre un issue o PR con una descripción clara del cambio, pruebas y actualización de documentación cuando aplique.

FigureVerse API es un backend desarrollado en Node.js y Express, diseñado para gestionar una tienda online de figuras de acción, cómics y coleccionables. Incluye módulos para productos, usuarios, pedidos, pagos y control de stock con autenticación JWT.
