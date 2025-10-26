// ==========================
// IMPORTS Y CONFIGURACIÓN
// ==========================
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const passport = require("./config/passport");
const { errorHandler } = require("./middlewares/errorHandler");
const swaggerConfig = require("./config/swagger");

// Importar rutas principales
const ordersRoutes = require("./routes/orders.routes");
const pagosRoutes = require("./routes/pagos.routes");
const enviosRoutes = require("./routes/envios.routes");
const descuentosRoutes = require("./routes/descuentos.routes"); // 🔥 Nuevo módulo

require("dotenv").config();
const app = express();

// ==========================
// MIDDLEWARES DE SEGURIDAD Y CONFIGURACIÓN GLOBAL
// ==========================
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use("/pagos/callback", bodyParser.raw({ type: "*/*" })); // Webhook MP
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

// ==========================
// RATE LIMIT (120 req/min)
// ==========================
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});
app.use(limiter);

// ==========================
// RUTAS PRINCIPALES
// ==========================
app.use("/auth", require("./routes/auth.routes"));
app.use("/users", require("./routes/users.routes"));
app.use("/pedidos", ordersRoutes);
app.use("/pagos", pagosRoutes);
app.use("/envios", enviosRoutes);
app.use("/descuentos", descuentosRoutes);

// ==========================
// RUTA DE ESTADO DEL SERVIDOR
// ==========================
app.get("/health", (req, res) =>
  res.json({ status: "OK", app: "FigureVerse API" })
);

// ==========================
// DOCUMENTACIÓN SWAGGER
// ==========================
app.use("/api-docs", swaggerConfig.serve, swaggerConfig.setup);

// ==========================
// MANEJO CENTRALIZADO DE ERRORES
// ==========================
app.use(errorHandler);

module.exports = app;
