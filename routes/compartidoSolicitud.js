const express = require('express');
const router = express.Router();
const { validatorIdSolicitud, validatorviajeSolicitud, validatorSolicitante, validatorOrganizationId } = require('../validators/compartidoValidators');
const { getItems, getItem, createItem, patchItem, patchItemIdTrip, deleteItem, getItemTrip, getItemByDocument, getItemsSolicitudesPagos, getItemsFilterOrganization } = require('../controllers/compartidoSolicitud');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:_id", authMiddleware(["all"]), validatorIdSolicitud, getItem);

router.get("/organizationId/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getItemsFilterOrganization);

router.get("/viaje/:idSolicitante", authMiddleware(["all"]), validatorSolicitante, getItemByDocument);

router.get("/solicitudes/:idViajeSolicitado", authMiddleware(["all"]), validatorviajeSolicitud, getItemTrip);

router.get("/solicitudesPagos/:idViajeSolicitado", authMiddleware(["all"]), validatorviajeSolicitud, getItemsSolicitudesPagos);

router.post("/registrar", authMiddleware(["all"]), validatorIdSolicitud, createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorIdSolicitud, patchItem);

router.patch("/idTrip/:_id", authMiddleware(["all"]), validatorIdSolicitud, patchItemIdTrip);

router.delete("/:_id", authMiddleware(["all"]), validatorIdSolicitud , deleteItem);

module.exports = router;
