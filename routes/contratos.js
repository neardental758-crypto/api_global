const express = require('express');
const router = express.Router();
const { validatorIdContratos, validatorOrganizationId } = require('../validators/compartidoValidators');
const { getItems, getItem, createItem, patchItem, deleteItem, getItemsFilterOrganization } = require('../controllers/contratos');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:_id", authMiddleware(["all"]), validatorIdContratos, getItem);

router.get("/organizationId/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getItemsFilterOrganization);

router.post("/registrar", authMiddleware(["all"]), validatorIdContratos, createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorIdContratos, patchItem);

router.delete("/:_id", authMiddleware(["all"]), validatorIdContratos , deleteItem);

module.exports = router;
