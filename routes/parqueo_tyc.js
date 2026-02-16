
const express = require('express');
const router = express.Router();
const { validatorCreate, validatorID, validator_update, validatorGetOrganizacion, validatorUpdateUsuario, 
    validator_update_saldo, validatorMassiveUpdateSaldos } = require('../validators/parqueo_tyc_validators');
const {  getItems, getItem, createItem, updateItem, updateItem_saldo, deleteItem, getUsuarioElectroHubByEmpresa,
     updateUsuarioElectroHub, processMassiveUpdateSaldos, getHistorialParqueosUsuario, getVehiculosUsuario } = require('../controllers/parqueo_tyc');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/usuario/:usuario", authMiddleware(["all"]), validatorID, getItem);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

router.post("/update_vel", authMiddleware(["all"]), validator_update, updateItem);

router.get("/usuario-electrohub/:idOrganizacion", authMiddleware(["all"]), validatorGetOrganizacion, getUsuarioElectroHubByEmpresa);

router.patch("/update-usuario/:usuario", authMiddleware(["all"]), validatorUpdateUsuario, updateUsuarioElectroHub);

router.post("/update_saldo", authMiddleware(["all"]), validator_update_saldo, updateItem_saldo);

router.post("/massive-update-saldos", authMiddleware(["all"]), validatorMassiveUpdateSaldos, processMassiveUpdateSaldos);

router.get("/historial-parqueos/:documento", authMiddleware(["all"]), getHistorialParqueosUsuario);

router.get("/vehiculos-usuario/:documento", authMiddleware(["all"]), getVehiculosUsuario);


module.exports = router;