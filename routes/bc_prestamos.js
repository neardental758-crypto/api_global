const express = require('express');
const router = express.Router();
const { validatorCreatePrestamos, validatorGetPrestamos, validatorStationId, validatorUpdatePrestamos,
     validatorGetUsuario, validatorOrganizationId, validatorFinalizeLoan, validatorFinalizeLoan4g} = require('../validators/prestamosValidators');
const { getItems, createItem, getItem, getItemPrestamoActivo, getItemPrestamoActivoPP, getItemPrestamosUsuario, updateItem, getItemAllPrestamoActivos, getItemAllPrestamoFinalizados, getItemsToDate, getItemAllPrestamoFinalizados3g, 
    getItemAllPrestamoFinalizados4g, patchItem, getItem_cortezza, getItems_cortezza,getMetricsForOrganization,
     getItemAllPrestamoActivos_cortezza, getItemAllPrestamoFinalizados_cortezza, getItemPrestamoActivo_cortezza,
      getItemPrestamosUsuario_cortezza, getItemByBicicleta,getItemsForReports, getItemsForReportsByStation,
       getItemsForReportsByOrganization, finalizeLoan, finalizeLoan4g} = require('../controllers/prestamos');
const authMiddleware = require('../middleware/session');
const checkPrestamoActivo = require("../middleware/checkPrestamoActivo");

router.get("/",authMiddleware(["all"]), getItems);

router.get("/id/:pre_id", authMiddleware(["all"]), validatorGetPrestamos, getItem); 

router.get("/prestamoActivos", authMiddleware(["all"]), getItemAllPrestamoActivos);
router.get("/prestamoFinalizados", authMiddleware(["all"]), getItemAllPrestamoFinalizados);

router.get("/3g/prestamoFinalizados/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getItemAllPrestamoFinalizados3g);
router.get("/4g/prestamoFinalizados/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getItemAllPrestamoFinalizados4g);

router.get("/prestamoFinalizadosFilter", authMiddleware(["all"]), getItemsToDate);

router.get("/prestamoActivo/:pre_usuario", authMiddleware(["all"]), validatorGetUsuario, getItemPrestamoActivo);
router.get("/prestamoActivoPP/:pre_usuario", authMiddleware(["all"]), validatorGetUsuario, getItemPrestamoActivoPP);

router.get("/prestamoUsuario/:pre_usuario", authMiddleware(["all"]), validatorGetUsuario, getItemPrestamosUsuario);

//router.post("/registrar", authMiddleware(["all"]), validatorCreatePrestamos, createItem);

router.post(
    "/registrar",
    authMiddleware(["all"]),
    checkPrestamoActivo,
    validatorCreatePrestamos,
    createItem
);

router.get("/bicicleta/:bic_id", authMiddleware(["all"]), getItemByBicicleta);

router.post("/updateEstado", authMiddleware(["all"]), validatorGetPrestamos, updateItem);
router.patch("/:pre_id", authMiddleware(["all"]), validatorGetPrestamos, patchItem);
router.put("/updateState", authMiddleware(["all"]), validatorGetPrestamos, updateItem);

router.get("/reports", authMiddleware(["all"]), getItemsForReports);
router.get("/reports/organization/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getItemsForReportsByOrganization);
router.get("/reports/station/:stationId", authMiddleware(["all"]), validatorStationId, getItemsForReportsByStation);

router.patch("/finalize/3g/:pre_id", 
    authMiddleware(["all"]), 
    validatorFinalizeLoan, 
    finalizeLoan
);

router.patch("/finalize/4g/:pre_id", 
    authMiddleware(["all"]), 
    validatorFinalizeLoan4g, 
    finalizeLoan4g
);

//Router cortezza
router.get("/all", authMiddleware(["external"]), getItems_cortezza);
router.get("/id_cortezza/:pre_id", authMiddleware(["external"]), validatorGetPrestamos, getItem_cortezza); 
router.get("/prestamoActivos_cortezza", authMiddleware(["external"]), getItemAllPrestamoActivos_cortezza);
router.get("/prestamoFinalizados_cortezza", authMiddleware(["external"]), getItemAllPrestamoFinalizados_cortezza);
router.get("/prestamoActivo_cortezza/:pre_usuario", authMiddleware(["external"]), validatorGetUsuario, getItemPrestamoActivo_cortezza);
router.get("/prestamoUsuario_cortezza/:pre_usuario", authMiddleware(["external"]), validatorGetUsuario, getItemPrestamosUsuario_cortezza);


//Funcion para calcular metricas desde el dashboard
// router.get("/metrics/organization/:organizationId", authMiddleware(["all"]), getMetricsForOrganization);
module.exports = router;