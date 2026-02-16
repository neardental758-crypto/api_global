const express = require('express');
const router = express.Router();
const { validatorCreateBicicleteros, validatorGetBicicleteros, validatorGetClave, validatorGetKEY  } = require('../validators/bicicleterosValidators');
const { getItems, createItem, getItem, getItemClave, updateKey, getItemClave_cortezza } = require('../controllers/bicicletero');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:bro_id", authMiddleware(["all"]), validatorGetBicicleteros, getItem);

router.post("/registrarbicicleta", authMiddleware(["all"]), validatorCreateBicicleteros, createItem);

router.get("/estacion/:bro_estacion/bicicleta/:bro_bicicleta", authMiddleware(["all"]), validatorGetClave, getItemClave);

router.post("/changeKey", authMiddleware(["all"]), validatorGetKEY, updateKey);

//Router cortezza
router.get("/estacion_cortezza/:bro_estacion/bicicleta/:bro_bicicleta", authMiddleware(["external"]), validatorGetClave, getItemClave_cortezza);

module.exports = router;