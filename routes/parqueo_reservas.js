const express = require('express');
const router = express.Router();
const { validatorCreateReservas, validatorGetReservas, validatorUpdateReservas, validatorGetUsuario, validatorVehiculo, validatorUpdateEstado} = require('../validators/parqueo_reservas_validators');
const { getItems, createItem, getItem, getItemUsuario, updateItem, updateItemVehiculo, updateEstadoReserva, temporizador } = require('../controllers/parqueo_reservas');
const authMiddleware = require('../middleware/session');

router.get("/", getItems);

router.get("/id/:id", authMiddleware(["all"]), validatorGetReservas, getItem);

router.get("/usuario/:usuario", authMiddleware(["all"]), validatorGetUsuario, getItemUsuario);

router.post("/registrar", validatorCreateReservas, createItem);

router.post("/temporizador", authMiddleware(["all"]), temporizador);


router.post("/updateEstado", authMiddleware(["all"]), validatorGetReservas, updateItem);

router.post("/updateVehiculo", authMiddleware(["all"]), validatorVehiculo, updateItemVehiculo);

router.post("/updateVehiculo",  authMiddleware(["all"]), validatorVehiculo, updateItemVehiculo);


module.exports = router;