const express = require('express');
const router = express.Router();
const { validatorIdViajeActivo, validatorDocument, validatorConductorViajeActivo, validatorOrganizacionViajeActivo, validatorOrganizationId } = require('../validators/compartidoValidators');
const { getItems, getItemTripEnd, getItem, getItemAllPrestamoActivos, getItemPrestamoActivoConductor, getItemAllPrestamoActivosFiltered, getItemAllPrestamoActivosFilteredToAplication, 
    getItemPrestamoActivoConductorProceso , getItemPrestamoActivoOrganizacion, getItemPrestamoActivo, createItem, patchItem, deleteItem, getItemsFilterOrganization, getItemsByCompatidoViajesOrganization } = require('../controllers/compartidoViajeActivo');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:_id", authMiddleware(["all"]), validatorIdViajeActivo, getItem);

router.get("/organizationId/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getItemsFilterOrganization);

router.get("/organizationById/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getItemsByCompatidoViajesOrganization);


router.get("/prestamoActivos", authMiddleware(["all"]), getItemAllPrestamoActivos);

router.get("/viajes/:documento", authMiddleware(["all"]), getItemAllPrestamoActivosFiltered);

router.get("/viajesFiltered/:documento", authMiddleware(["all"]), getItemAllPrestamoActivosFilteredToAplication);

router.get("/prestamoActivo/:_id", authMiddleware(["all"]) , validatorIdViajeActivo, getItemPrestamoActivo);

router.get("/viajeTerminado/:conductor", authMiddleware(["all"]) , validatorDocument, getItemTripEnd);

router.get("/conductorActivo/:conductor", authMiddleware(["all"]), validatorConductorViajeActivo, getItemPrestamoActivoConductor);

router.get("/conductorProceso/:conductor", authMiddleware(["all"]), validatorConductorViajeActivo, getItemPrestamoActivoConductorProceso);

router.get("/organizacion/:idOrganizacion", authMiddleware(["all"]), validatorOrganizacionViajeActivo, getItemPrestamoActivoOrganizacion);

router.post("/registrar", authMiddleware(["all"]),validatorIdViajeActivo, createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorIdViajeActivo, patchItem);

router.delete("/:_id", authMiddleware(["all"]), validatorIdViajeActivo , deleteItem);

module.exports = router;
