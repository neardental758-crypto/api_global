const express = require('express');
const router = express.Router();
const { validatorIdConductor, validatorOrganizationId } = require('../validators/compartidoValidators');
const { getItems, getItem, createItem, updateItem, patchItem, deleteItem, getItemsFilterOrganization, getItinerario, getHistorial, getCoductoresByOrganization } = require('../controllers/compartidoConductor');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:_id", authMiddleware(["all"]), validatorIdConductor, getItem);

router.get("/itinerario/:_id", authMiddleware(["all"]), validatorIdConductor, getItinerario);

router.get("/historial/:_id", authMiddleware(["all"]), validatorIdConductor, getHistorial);

router.get("/organizationId/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getItemsFilterOrganization);

router.get("/organizationById/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getCoductoresByOrganization);


router.post("/registrar", authMiddleware(["all"]),validatorIdConductor, createItem);

router.put("/", authMiddleware(["all"]), updateItem);

router.patch("/:_id", authMiddleware(["all"]), validatorIdConductor, patchItem);

router.delete("/:_id", authMiddleware(["all"]), deleteItem);

module.exports = router;
