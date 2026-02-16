const express = require('express');
const router = express.Router();
const { validatorCreatePenalizacion, validatorGetPenalizacion, validatorGetUsuario } = require('../validators/penalizacionValidators');
const { getItems, createItem, getItem, getItemUser } = require('../controllers/penalizacion');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:pen_id", authMiddleware(["all"]), validatorGetPenalizacion, getItem);

router.get("/usuario/:pen_usuario", authMiddleware(["all"]), validatorGetUsuario, getItemUser);

router.post("/registrar", authMiddleware(["all"]), validatorCreatePenalizacion, createItem);

module.exports = router;