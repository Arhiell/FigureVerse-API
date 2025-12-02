<h1 align="center">🧩 FigureVerse API</h1>

<p align="center">
🚀 API enfocada en peticiones rápidas de productos de <strong>cómic</strong>, <strong>manga</strong>, <strong>figuras</strong> y coleccionables, optimizada para catálogos, carritos, pagos, envíos y gestión administrativa.
</p>

<table>
  <tr>
    <th>📘 Introducción</th>
  </tr>
  <tr>
    <td>
      Esta API sirve como núcleo del ecosistema <strong>FigureVerse</strong>, dando soporte a la <em>web</em> y la <em>aplicación de escritorio</em>. Proporciona endpoints REST para gestionar usuarios, productos, carritos, pedidos, pagos (Mercado Pago), envíos, reseñas, soporte, auditoría y más.
      <br/><br/>
      Base path del servicio: <code>http://localhost:3000</code> • Salud del servidor: <code>GET /</code>
    </td>
  </tr>

  <tr>
    <th>🧰 Tecnologías</th>
  </tr>
  <tr>
    <td>
      - <strong>Node.js</strong> + <strong>Express</strong> • <code>feraytek-api-main/src/app.js</code><br/>
      - <strong>MySQL</strong> (con <code>mysql2</code>) • Config en <code>src/config/database.js</code><br/>
      - <strong>JWT</strong> para autenticación • Middleware en <code>src/middleware/auth.js</code><br/>
      - <strong>Mercado Pago</strong> integración • <code>src/services/pago.service.js</code><br/>
      - <strong>Firebase Admin</strong> (Cloud Functions y emulador) • <code>firebase.json</code>, <code>functions/</code>
    </td>
  </tr>

  <tr>
    <th>🧱 Requisitos</th>
  </tr>
  <tr>
    <td>
      - Node.js 18+<br/>
      - MySQL 8.x (o compatible)<br/>
      - Cuenta de <em>Mercado Pago</em> (modo Sandbox) para pruebas<br/>
      - Opcional: Firebase CLI para emuladores
    </td>
  </tr>

  <tr>
    <th>⚙️ Instalación</th>
  </tr>
  <tr>
    <td>
      1) Clonar el repositorio<br/>
      <pre><code>git clone https://github.com/Arhiell/FigureVerse-API.git
cd FigureVerse-API</code></pre>
      2) Instalar dependencias<br/>
      <pre><code>npm install</code></pre>
    </td>
  </tr>

  <tr>
    <th>🔑 Configuración (.env)</th>
  </tr>
  <tr>
    <td>
      Copiar <code>feraytek-api-main/.env.example</code> a <code>feraytek-api-main/.env</code> y completar variables:
      <pre><code>PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=***
DB_NAME=feraytek
DB_PORT=3306

# Mercado Pago (Sandbox)

MP_ACCESS_TOKEN=TEST
MP_PUBLIC_KEY=TEST</code></pre>
⚠️ No subir credenciales reales al repositorio. Usa variables de entorno.
</td>

  </tr>

  <tr>
    <th>🏃 Ejecución</th>
  </tr>
  <tr>
    <td>
      Arranque del servidor (punto de entrada): <code>feraytek-api-main/src/server.js</code><br/>
      <pre><code>npm run dev</code></pre>
      Al iniciar: crea tablas para auditoría y restablecimiento de contraseña • Logs en consola.
    </td>
  </tr>

  <tr>
    <th>📂 Estructura del proyecto</th>
  </tr>
  <tr>
    <td>
      - <code>feraytek-api-main/src/app.js</code>: Configura middlewares y registra rutas<br/>
      - <code>src/controllers/</code>: Lógica HTTP de cada módulo<br/>
      - <code>src/services/</code>: Reglas de negocio y validaciones<br/>
      - <code>src/models/</code>: Acceso a datos (MySQL)<br/>
      - <code>src/routes/</code>: Definición de endpoints y paths base<br/>
      - <code>src/middleware/</code>: Auth, auditoría, validaciones, errores<br/>
      - <code>functions/</code>: Firebase Functions y emuladores
    </td>
  </tr>

  <tr>
    <th>🧭 Endpoints principales</th>
  </tr>
  <tr>
    <td>
      - 👤 Usuarios: <code>/api/users</code> • Registro, login, perfiles • Ej.: <code>GET /api/users/:id</code> (<code>src/controllers/user.controller.js</code>)<br/>
      - 🛍️ Productos: <code>/api/productos</code> • Listar, detalle • Ej.: <code>GET /api/productos/:id</code> (<code>src/controllers/producto.controller.js</code>)<br/>
      - 🗂️ Categorías: <code>/api/categorias</code> • CRUD categorías<br/>
      - 🖼️ Imágenes: <code>/api/imagenes_productos</code><br/>
      - ⭐ Reseñas: <code>/api/resenas</code><br/>
      - 🛒 Carrito: <code>/api/carrito</code> • Agregar/eliminar/vaciar, estadísticas admin<br/>
      - 📦 Pedidos: <code>/api/pedidos</code> • Detalle y listado con permisos<br/>
      - 💳 Pagos: <code>/api/pagos</code> • Preferencias, estados, <code>POST /api/pagos/webhook</code><br/>
      - 🚚 Envíos: <code>/api/envios</code> • Crear, actualizar, cambiar estado<br/>
      - 🧾 Facturas: <code>/api/facturas</code><br/>
      - 🛠️ Admin: <code>/api/admin</code> • Gestión administrativa y superadmin <code>/api/superadmin</code><br/>
      - 🧑‍💻 Gestión de usuario: <code>/api/user-management</code><br/>
      - 🔐 Auth y recuperación: <code>/api/auth</code> (reset de contraseña)<br/>
      - 🏷️ Descuentos: <code>/api/descuentos</code> • Variantes: <code>/api/variantes</code><br/>
      - 🆘 Soporte: <code>/api/soporte</code> • Tickets, prioridades
      <br/><br/>
      Ruta raíz de salud: <code>GET /</code> → <em>"8D API Feraytek - Servidor activo"</em>
    </td>
  </tr>

  <tr>
    <th>🔐 Autenticación y roles</th>
  </tr>
  <tr>
    <td>
      JWT vía middleware (<code>src/middleware/auth.js</code>). Roles: <code>cliente</code>, <code>admin</code>, <code>superadmin</code>.<br/>
      Endpoints con restricción verifican permisos y propiedad de recursos (p. ej. pedidos).
    </td>
  </tr>

  <tr>
    <th>🌐 Integraciones</th>
  </tr>
  <tr>
    <td>
      - Mercado Pago (sandbox) • Webhook: <code>POST /api/pagos/webhook</code><br/>
      - Firebase Admin • Emuladores vistos en <code>firebase.json</code>
    </td>
  </tr>

  <tr>
    <th>🗄️ Base de datos</th>
  </tr>
  <tr>
    <td>
      MySQL con tablas para usuarios, productos, carritos, pedidos, envíos, reseñas, auditoría, etc.<br/>
      Conexión en <code>src/config/database.js</code> y modelos en <code>src/models/</code>.
    </td>
  </tr>

  <tr>
    <th>🧪 Scripts y datos</th>
  </tr>
  <tr>
    <td>
      Semillas y utilidades en <code>src/scripts/</code> (<code>seed.js</code>, listado de productos, reseñas). Ejecuta con Node.
    </td>
  </tr>

  <tr>
    <th>🧯 Seguridad</th>
  </tr>
  <tr>
    <td>
      - No subir claves privadas ni tokens productivos. Usa <code>.env</code> y gestores seguros.<br/>
      - Limitar CORS según origen en producción.<br/>
      - Validar datos en <code>services/</code> y sanitizar entradas.
    </td>
  </tr>

  <tr>
    <th>🔎 Ejemplo rápido</th>
  </tr>
  <tr>
    <td>
      Obtener producto por ID:<br/>
      <pre><code>curl http://localhost:3000/api/productos/123</code></pre>
    </td>
  </tr>

  <tr>
    <th>🔗 Repositorios relacionados</th>
  </tr>
  <tr>
    <td>
      - 🌐 Web (catálogo y compras): <a href="https://github.com/Arhiell/FigureVerse_Web">FigureVerse_Web</a><br/>
      - 🖥️ Escritorio (gestión administrativa): <a href="https://github.com/BautiC-9/FigureVerse-Escritorio">FigureVerse-Escritorio</a><br/>
      - 🧠 API Python (Cloud Functions + Gemini): <a href="https://github.com/Arhiell/FigureVerse_API_Python">FigureVerse_API_Python</a>
    </td>
  </tr>

  <tr>
    <th>🏫 Créditos</th>
  </tr>
  <tr>
    <td>
      Universidad Tecnológica Nacional (UTN) – Facultad Regional Resistencia<br/>
      Carrera: Técnico Universitario en Programación<br/>
      Autores: Ayala, Ariel • Capovilla, Bautista<br/>
      Profesores: Python – Goya, Juan Manuel • JavaScript – Puljiz, Emilio
    </td>
  </tr>
</table>
