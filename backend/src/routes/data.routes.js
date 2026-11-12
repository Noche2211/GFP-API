const express = require('express');
const controller = require('../controllers/data.controller');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Todas las rutas de datos exigen un token de sesión válido
router.use(requireAuth);
router.get('/:resource/:userId', controller.list);
router.post('/:resource', controller.save);
router.delete('/:resource/:id', controller.remove);

module.exports = router;
