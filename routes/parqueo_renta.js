const express = require('express');
const router = express.Router();
const { 
    validatorCreate, 
    validatorGet, 
    validatorUpdate,
    validatorGetUsuario,
    validatorGetEmpresaId
} = require('../validators/parqueo_renta_validators');
const { 
    getItems, 
    getItem, 
    getItemUsuario, 
    createItem, 
    updateItem, 
    deleteItem, 
    getItemPrestamoActivo, 
    getItemAllPrestamoActivos, 
    getItemAllPrestamoFinalizados, 
    getItemsToDate,
    getElectroHubReports,
    patchItem } = require('../controllers/parqueo_renta');
const authMiddleware = require('../middleware/session');

router.get("/",authMiddleware(["all"]), getItems);

router.get("/id/:id", authMiddleware(["all"]), validatorGet, getItem); 

router.get("/prestamoActivos", authMiddleware(["all"]), getItemAllPrestamoActivos);

router.get("/prestamoFinalizados", authMiddleware(["all"]), getItemAllPrestamoFinalizados);

router.get("/prestamoFinalizadosFilter", authMiddleware(["all"]), getItemsToDate);

router.get("/prestamoActivo/:usuario", authMiddleware(["all"]), validatorGetUsuario, getItemPrestamoActivo);

router.get("/usuario/:usuario", authMiddleware(["all"]), validatorGetUsuario, getItemUsuario);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

router.post("/updateEstado", authMiddleware(["all"]), validatorGet, updateItem);

router.patch("/:id", authMiddleware(["all"]), validatorGet, patchItem);

router.put("/updateState", authMiddleware(["all"]), validatorGet, updateItem);

router.get("/electrohubReports/:empresaId", authMiddleware(["all"]), getElectroHubReports);


module.exports = router;