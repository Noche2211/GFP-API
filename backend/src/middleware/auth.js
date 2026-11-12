/**
 * Token de sesión firmado con HMAC-SHA256 (sin dependencias externas).
 * Formato: base64url({ id, creado, exp }) + "." + firma.
 * La clave sale de SESSION_SECRET; si no existe, se genera una al iniciar el
 * servidor y las sesiones anteriores dejan de ser válidas al reiniciar.
 *
 * El token guarda también la fecha de creación de la cuenta: si la base de datos
 * se reinicia (como en el disco temporal de Render) y otra cuenta recibe el mismo
 * id, el token anterior no coincide y se rechaza.
 */
const crypto = require('crypto');
const db = require('../config/database');

const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const DURACION_MS = 7 * 24 * 60 * 60 * 1000;

function firmar(cuerpo) {
    return crypto.createHmac('sha256', SECRET).update(cuerpo).digest('base64url');
}

function fechaCreacion(userId) {
    return db.prepare('SELECT created_at FROM users WHERE id = ?').get(Number(userId))?.created_at || null;
}

function crearToken(userId) {
    const datos = { id: Number(userId), creado: fechaCreacion(userId), exp: Date.now() + DURACION_MS };
    const cuerpo = Buffer.from(JSON.stringify(datos)).toString('base64url');
    return `${cuerpo}.${firmar(cuerpo)}`;
}

function leerToken(token) {
    const [cuerpo, firma] = String(token || '').split('.');
    if (!cuerpo || !firma) return null;
    const esperada = Buffer.from(firmar(cuerpo));
    const recibida = Buffer.from(firma);
    if (esperada.length !== recibida.length || !crypto.timingSafeEqual(esperada, recibida)) return null;
    try {
        const datos = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8'));
        if (!Number.isInteger(datos.id) || datos.exp < Date.now()) return null;
        return datos;
    } catch {
        return null;
    }
}

/**
 * Exige un token válido en el encabezado Authorization: Bearer <token>
 * y deja el usuario autenticado en req.userId.
 */
function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const datos = leerToken(header.startsWith('Bearer ') ? header.slice(7) : '');
    // La cuenta debe seguir existiendo y ser la misma para la que se emitió el token
    if (!datos || !datos.creado || fechaCreacion(datos.id) !== datos.creado) {
        return res.status(401).json({ message: 'Tu sesión no es válida o expiró. Inicia sesión nuevamente.' });
    }
    req.userId = datos.id;
    next();
}

/**
 * Indica si el identificador recibido es de un usuario distinto al autenticado.
 */
function esOtroUsuario(req, userId) {
    return userId !== undefined && userId !== null && userId !== '' && Number(userId) !== req.userId;
}

module.exports = { crearToken, requireAuth, esOtroUsuario };
