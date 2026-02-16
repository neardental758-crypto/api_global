const express = require('express');
const router = express.Router();
const { validatorIdComentarios, validatorIdCalificacion, validatorCreateComentarios, validatorOrganizationId } = require('../validators/compartidoValidators');
const { getItems, getItem, createItem, patchItem, deleteItem, getItemsIdCalificacion, getItemsFilterOrganization } = require('../controllers/compartidoComentarios');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/organizationId/:organizationId", authMiddleware(["all"]), validatorOrganizationId, getItemsFilterOrganization);

router.get("/id/:_id", authMiddleware(["all"]), validatorIdComentarios, getItem);

router.get("/idCalificacion/:idCalificacion", authMiddleware(["all"]), validatorIdCalificacion, getItemsIdCalificacion);

router.post("/registrar", authMiddleware(["all"]), validatorCreateComentarios, createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorIdComentarios, patchItem);

router.delete("/:_id", authMiddleware(["all"]), validatorIdComentarios, deleteItem);

module.exports = router;

