/**
 * Punto de entrada del servidor.
 */

require("dotenv").config();
require("./src/database/init");

const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});