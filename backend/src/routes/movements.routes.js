const express = require("express");
const router = express.Router();
const controller = require("../controllers/movements.controller");

router.post("/", controller.createMovement);
router.get("/:userId", controller.getMovements);
router.put("/:id", controller.updateMovement);
router.delete("/:id", controller.deleteMovement);

module.exports = router;
