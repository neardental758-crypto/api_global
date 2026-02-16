const express = require('express');
const router = express.Router();
const { validatorCreate, validatorGet, validatorUpdate, validatorGetUsuario, validatorVehiculo, validatorGetVehiculoUsuario, validatorEmpresa} = require('../validators/vpusuarioValidators');
const { getItems, createItem, getItem, getItemUsuario, updateItem, updateItemVehiculo, getIValidateVehiculo, getVehiculosUsuario, getVehiculosPorEmpresa} = require('../controllers/vpusuario');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:vus_id", authMiddleware(["all"]), validatorGet, getItem);

router.get("/usuario/:vus_usuario", authMiddleware(["all"]), validatorGetUsuario, getItemUsuario);

//router.get("/validarVehiculo", validatorGetVehiculoUsuario, getIValidateVehiculo);

router.get("/id/:vus_id/usu/:vus_usuario", authMiddleware(["all"]), validatorGetVehiculoUsuario, getIValidateVehiculo);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

router.post("/updateEstado", authMiddleware(["all"]), validatorGet, updateItem);

router.post("/updateVehiculo", authMiddleware(["all"]), validatorVehiculo, updateItemVehiculo);

router.get("/vehiculos-usuario", authMiddleware(["all"]), getVehiculosUsuario);

router.get("/empresa/:empresaId", authMiddleware(["all"]), validatorEmpresa, getVehiculosPorEmpresa);

module.exports = router;