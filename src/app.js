const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./middlewares/errorHandler");
require("dotenv").config();

const app = express();

// Seguridad básica
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(morgan("dev"));

// Rate limit
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});
app.use(limiter);

// Rutas
app.get("/health", (req, res) => res.json({ status: "OK", app: "FigureVerse API" }));

app.use("/auth", require("./routes/auth.routes"));

// Middleware de errores
app.use(errorHandler);

module.exports = app;