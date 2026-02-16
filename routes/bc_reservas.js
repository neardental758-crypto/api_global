const express = require('express');
const router = express.Router();
const { validatorCreateReservas, validatorGetReservas, validatorUpdateReservas, validatorGetUsuario, validatorVehiculo, validatorUpdateEstado} = require('../validators/reservasValidators');
const { getItems, createItem, getItem, getItemUsuario, updateItem, updateItemVehiculo, getItem_cortezza, getItemUsuario_cortezza, updateEstadoReserva, temporizador, getReservas4G, getReservas3G } = require('../controllers/reservas');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:res_id", authMiddleware(["all"]), validatorGetReservas, getItem);

router.get("/usuario/:res_usuario", authMiddleware(["all"]), validatorGetUsuario, getItemUsuario);

router.post("/registrar", authMiddleware(["all"]), validatorCreateReservas, createItem);

router.get("/4g/:emp_id", authMiddleware(["all"]), getReservas4G);
router.get("/3g/:emp_id", authMiddleware(["all"]), getReservas3G);


router.post("/temporizador", authMiddleware(["all"]), temporizador);


router.post("/updateEstado", authMiddleware(["all"]), validatorGetReservas, updateItem);

router.post("/updateVehiculo", authMiddleware(["all"]), validatorVehiculo, updateItemVehiculo);

router.post("/updateVehiculo",  authMiddleware(["all"]), validatorVehiculo, updateItemVehiculo);


router.get("/id_cortezza/:res_id", authMiddleware(["external"]), validatorGetReservas, getItem_cortezza);
router.get("/usuario_cortezza/:res_usuario", authMiddleware(["external"]), validatorGetUsuario, getItemUsuario_cortezza);

module.exports = router;