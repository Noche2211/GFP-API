const express = require('express');
const controller = require('../controllers/data.controller');
const router = express.Router();

router.get('/:resource/:userId', controller.list);
router.post('/:resource', controller.save);
router.delete('/:resource/:id', controller.remove);

module.exports = router;
