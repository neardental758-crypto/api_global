const express = require('express');
const router = express.Router();
const { validatorIdPasajero, validatorOrganizationId } = require('../validators/compartidoValidators');
const { getItems, getItem, createItem, updateItem, patchItem, deleteItem, getItemsFilterOrganization, getPasajerosByOrganization} = require('../controllers/compartidoPasajero');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:_id", authMiddleware(["all"]), validatorIdPasajero, getItem);

router.get("/organizationId/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getItemsFilterOrganization);

router.get("/organizationById/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getPasajerosByOrganization);

router.post("/registrar", authMiddleware(["all"]),validatorIdPasajero, createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorIdPasajero, patchItem);

router.delete("/:_id", authMiddleware(["all"]), deleteItem);

module.exports = router;
