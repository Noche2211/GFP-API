/**
 * Configuración principal de Express.
 */

const express = require("express");
const cors = require("cors");

const usersRoutes = require("./routes/users.routes");

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Ruta principal de usuarios.
 */
app.use("/api/users", usersRoutes);

module.exports = app;