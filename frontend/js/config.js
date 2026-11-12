/*
    frontend/js/config.js
    Propósito: Lógica de la aplicación y comportamiento del usuario para esta página.
*/
/* exported API_BASE_URL, authHeaders */
// Configuración global del proyecto
const API_BASE_URL = 'https://gfp-api-b8h3.onrender.com';

// Encabezado con el token de sesión que entrega el servidor al iniciar sesión
function authHeaders(extra = {}) {
    const token = JSON.parse(localStorage.getItem('currentUser') || 'null')?.token;
    return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}
