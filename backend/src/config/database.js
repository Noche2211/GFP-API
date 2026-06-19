/**

 * Conexión nativa con node:sqlite (Sin dependencias externas)
 */
const { DatabaseSync } = require('node:sqlite');

// Crea y conecta la base de datos de forma síncrona
const db = new DatabaseSync(process.env.DB_PATH);

console.log("Base de datos conectada nativamente.");

module.exports = db;