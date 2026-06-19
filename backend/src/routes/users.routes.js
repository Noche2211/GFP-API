/**
 * Define rutas CRUD de usuarios.
 */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/users.controller");

/**
 * CREATE
 */
router.post("/", controller.createUser);

/**
 * LOGIN
 */
router.post("/login", controller.loginUser);

/**
 * READ
 */
router.get("/", controller.getUsers);

/**
 * UPDATE
 */
router.put("/:id", controller.updateUser);

/**
 * DELETE
 */
router.delete("/:id", controller.deleteUser);

module.exports = router;