const express = require('express');
const router = express.Router();
const {
    validatorCreate,
    validatorGet,
    validatorUpdate,
    validatorGetUsuario,
    validatorVehiculo,
    validatorGetVehiculoUsuario,
    validatorGetTrip} = require('../validators/vpviajesValidators');
const {
    getItems,
    createItem,
    getItem,
    getItemUsuario,
    updateItemState,
    getIValidateVehiculo,
    getItemViajeActivo,
    updateItemTrip,
    getItemsFilter} = require('../controllers/vpviajes');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/tripsFilter", authMiddleware(["all"]), getItemsFilter);

router.get("/id/:via_usuario", authMiddleware(["all"]), validatorGetUsuario, getItem);

router.get("/usuario/:via_usuario", authMiddleware(["all"]), validatorGetUsuario, getItemUsuario);

router.get("/viajeActivo/:via_usuario", authMiddleware(["all"]), validatorGetUsuario, getItemViajeActivo);

router.get("/id/:via_id/usu/:via_usuario", authMiddleware(["all"]), validatorGetVehiculoUsuario, getIValidateVehiculo);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

router.post("/updateEstado", authMiddleware(["all"]), validatorGet, updateItemState);

router.post("/updateTrip", authMiddleware(["all"]), validatorGetTrip, updateItemTrip);


module.exports = router;
