/**
 * Punto de entrada principal del servidor.
 */

// Carga variables de entorno para configuración sensible
require("dotenv").config();

// Inicializa la conexión y configuración de la base de datos
require("./src/database/init");

// Importa la instancia de la aplicación Express
const app = require("./src/app");

// Importa middleware para habilitar el intercambio de recursos de origen cruzado (CORS)
const cors = require("cors");
const express = require("express");

// Habilita el acceso desde diferentes orígenes para el frontend
app.use(cors());

// Configura el servidor para parsear cuerpos de solicitud con formato JSON
app.use(express.json());

// Define el puerto del servidor basado en variables de entorno o por defecto en 3000
const PORT = process.env.PORT || 3000;

// Inicia el servidor y escucha peticiones en el puerto asignado
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});