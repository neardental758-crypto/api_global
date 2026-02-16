const express = require('express');
const router = express.Router();
const { validatorCreateHorarios, validatorGetHorarios, validatorGetNombre } = require('../validators/parqueo_horarios_validators');
const { getItems, createItem, getItem, getItemParqueadero} = require('../controllers/parqueo_horarios');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:hor_id", authMiddleware(["all"]), validatorGetHorarios, getItem);

router.post("/registrar", authMiddleware(["all"]), validatorCreateHorarios, createItem);

router.get("/parqueadero/:parqueadero", authMiddleware(["all"]), validatorGetNombre, getItemParqueadero);

module.exports = router;