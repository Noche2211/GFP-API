/**
 * Configuración principal de Express.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");

const usersRoutes = require("./routes/users.routes");
const dataRoutes = require('./routes/data.routes');

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Ruta principal de usuarios.
 */
app.use("/api/users", usersRoutes);
app.use('/api/data', dataRoutes);

const frontendPath = path.join(__dirname, "../../frontend");
app.use(express.static(frontendPath));
app.get("/", (req, res) => res.sendFile(path.join(frontendPath, "index.html")));

module.exports = app;