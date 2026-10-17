const express = require('express');
const createController = require('../controllers/records.controller');

module.exports = function recordsRoutes(table) {
    const router = express.Router();
    const controller = createController(table);
    router.get('/:userId', controller.list);
    router.post('/', controller.save);
    router.delete('/:id', controller.remove);
    return router;
};
