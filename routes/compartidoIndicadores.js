const express = require('express');
const router = express.Router();
const { validatorIdPenalizacion } = require('../validators/compartidoValidators');
const { getItems, getItem, createItem, patchItem, deleteItem } = require('../controllers/compartidoIndicadores');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:_id", authMiddleware(["all"]), validatorIdPenalizacion, getItem);

router.post("/registrar", authMiddleware(["all"]), createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorIdPenalizacion, patchItem);

router.delete("/:_id", authMiddleware(["all"]), validatorIdPenalizacion , deleteItem);

module.exports = router;
