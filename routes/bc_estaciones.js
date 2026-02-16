const express = require('express');
const router = express.Router();
const { validatorCreateEstacion, validatorGetUser, validatorGetNombre, validatorGetEmpresa, validatorUpdateEstacion } = require('../validators/estacionValidators');
const { getItems, createItem, getItem, getItemNombre, getItemEmpresa, getItem_empresa, updateEstacionData,
         getItem_cortezza, getItems_cortezza} = require('../controllers/estacion');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:est_id", authMiddleware(["all"]), validatorGetUser, getItem);

router.get("/nombre/:est_estacion", authMiddleware(["all"]), validatorGetNombre, getItemNombre);

router.get("/empresa/:est_empresa", authMiddleware(["all"]), validatorGetEmpresa, getItemEmpresa);

router.get("/estaciones/:est_empresa", authMiddleware(["all"]), validatorGetEmpresa, getItem_empresa);

router.post("/registrarestacion", authMiddleware(["all"]), validatorCreateEstacion, createItem);

router.put("/:est_id", authMiddleware(["all"]), validatorUpdateEstacion, updateEstacionData);


//Router cortezza
router.get("/all/", authMiddleware(["external"]), getItems_cortezza);
router.get("/empresa_cortezza/:est_empresa", authMiddleware(["external"]), validatorGetEmpresa, getItem_cortezza);


module.exports = router;