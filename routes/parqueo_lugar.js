const express = require('express');
const router = express.Router();
const { 
    validatorCreate, 
    validatorGetId, 
    validatorGetParqueadero, 
    validatorGetNumero,
    validatorGetQR,
    validatorUpdateLugar,
    validatorGetEmpresaId,
    validatorUpdateElectroHub,
    validatorGetBluetooth
} = require('../validators/parqueo_lugar_validators');
const { 
    getItems, 
    getItem, 
    getItemNumero, 
    getItemQR,
    getItemParqueaderoDisponible,
    getItemParqueaderoAll, 
    createItem, 
    updateItem, 
    deleteItem,
    getItemEmpresaId,
    updateItemElectroHub,
    getItemBluetooth,
    updateItem_qr,
    getItemEmpresaIdParqueaderos,
} = require('../controllers/parqueo_lugar');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:id", authMiddleware(["all"]), validatorGetId, getItem);

router.get("/bluetooth/:bluetooth", validatorGetBluetooth, getItemBluetooth);
router.get("/numero/:numero", authMiddleware(["all"]), validatorGetNumero, getItemNumero);
router.get("/qr/:qr", authMiddleware(["all"]), validatorGetQR, getItemQR);

router.get("/parqueaderoAll/:parqueadero", authMiddleware(["all"]), validatorGetParqueadero, getItemParqueaderoAll);
router.get("/parqueaderoDisponible/:parqueadero", authMiddleware(["all"]), validatorGetParqueadero, getItemParqueaderoDisponible);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

router.post("/updateEstado", authMiddleware(["all"]), validatorGetId, updateItem);
router.post("/updateEstadoQr",authMiddleware(["all"]), validatorGetQR, updateItem_qr);

router.put("/updateEstadoDash", authMiddleware(["all"]), validatorGetId, updateItem);

router.get("/empresa-id/:empresaId", authMiddleware(["all"]), validatorGetEmpresaId, getItemEmpresaId);

router.put("/id/:id", authMiddleware(["all"]), validatorUpdateElectroHub, updateItemElectroHub);
router.delete("/id/:id", authMiddleware(["all"]), validatorGetId, deleteItem);

module.exports = router;
