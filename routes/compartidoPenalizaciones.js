const express = require('express');
const router = express.Router();
const { validatorIdPenalizacion, validatorOrganizationId } = require('../validators/compartidoValidators');
const { getItems, getItem, createItem, patchItem, deleteItem, getItemsFilterOrganization } = require('../controllers/compartidoPenalizaciones');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:_id", authMiddleware(["all"]), validatorIdPenalizacion, getItem);

router.get("/organizationId/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getItemsFilterOrganization);

router.post("/registrar", authMiddleware(["all"]),validatorIdPenalizacion, createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorIdPenalizacion, patchItem);

router.delete("/:_id", authMiddleware(["all"]), validatorIdPenalizacion , deleteItem);

module.exports = router;
