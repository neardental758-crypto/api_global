const express = require('express');
const router = express.Router();
const { validatorCreate, validatorGet, validatorGetUsuario } = require('../validators/vehiculoFallaValidators');
const { getItems, createItem, getItem, getItemUsuario } = require('../controllers/vehiculoFalla');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:vef_id", authMiddleware(["all"]), validatorGet, getItem);

router.get("/usuario/:vef_usuario", authMiddleware(["all"]), validatorGetUsuario, getItemUsuario);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

module.exports = router;