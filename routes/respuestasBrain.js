const express = require('express');
const router = express.Router();
const { validatorCreate, validatorID } = require('../validators/respuestasBrainValidators');
const { getItems, getItem, createItem, patchItem, deleteItem } = require('../controllers/respuestasBrain');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:_id", authMiddleware(["all"]), validatorID, getItem);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorID, patchItem);

router.delete("/:_id", authMiddleware(["all"]), validatorID , deleteItem);

module.exports = router;
