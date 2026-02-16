const express = require('express');
const router = express.Router();
const { validatorCreateHorarios, validatorGetHorarios, validatorGetNombre } = require('../validators/horariosValidators');
const { getItems, createItem, getItem, getItemEmpresa, getItemEmpresa_cortezza} = require('../controllers/horarios');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:hor_id", authMiddleware(["all"]), validatorGetHorarios, getItem);

router.post("/registrar", authMiddleware(["all"]), validatorCreateHorarios, createItem);

router.get("/empresa/:hor_empresa", authMiddleware(["all"]), validatorGetNombre, getItemEmpresa);

//Router cortezza
router.get("/empresa_cortezza/:hor_empresa", authMiddleware(["external"]), validatorGetNombre, getItemEmpresa_cortezza);

module.exports = router;