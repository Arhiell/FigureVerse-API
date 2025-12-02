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

## 🏫 Créditos

Universidad Tecnológica Nacional (UTN) – Facultad Regional Resistencia

Carrera: Técnico Universitario en Programación

Autores: Ayala, Ariel • Capovilla, Bautista

Profesores: Python – Goya, Juan Manuel • JavaScript – Puljiz, Emilio
