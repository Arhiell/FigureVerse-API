const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const passport = require("./config/passport");
const { errorHandler } = require("./middlewares/errorHandler");
const swaggerConfig = require("./config/swagger");
require("dotenv").config();

const app = express();

// Seguridad básica
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

// Rate limit
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});
app.use(limiter);

// Rutas
app.get("/health", (req, res) => res.json({ status: "OK", app: "FigureVerse API" }));

// Documentación Swagger
app.use("/api-docs", swaggerConfig.serve, swaggerConfig.setup);

app.use("/auth", require("./routes/auth.routes"));
app.use("/users", require("./routes/users.routes"));
app.use("/productos", require("./routes/producto.routes"));
app.use("/categorias", require("./routes/categoria.routes"));
app.use("/universos", require("./routes/universos.routes"));
app.use('/api/variantes', require('./routes/variante.routes'));
app.use('/api/imagenes', require('./routes/imagen.routes'));
app.use("/carrito", require("./routes/carrito.routes"));
app.use("/facturas", require("./routes/factura.routes"));
app.use("/orders", require("./routes/orders.routes"));


// Middleware de errores
app.use(errorHandler);

module.exports = app;