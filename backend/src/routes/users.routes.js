/**
 * Define rutas CRUD de usuarios.
 * Crear cuenta e iniciar sesión son públicas; el resto exige token de sesión.
 */

const express = require('express');
const router = express.Router();

const controller = require('../controllers/users.controller');
const { requireAuth } = require('../middleware/auth');

/**
 * CREATE
 */
router.post('/', controller.createUser);

/**
 * LOGIN
 */
router.post('/login', controller.loginUser);

/**
 * READ (solo el usuario autenticado)
 */
router.get('/', requireAuth, controller.getUsers);

/**
 * UPDATE
 */
router.put('/:id', requireAuth, controller.updateUser);

/**
 * DELETE
 */
router.delete('/:id', requireAuth, controller.deleteUser);

module.exports = router;
