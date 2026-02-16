const express = require('express');
const router = express.Router();
const { validatorCreate, validatorID } = require('../validators/tematicaValidators');
const { getItems, getItem, createItem, patchItem, deleteItem, getAllTematicas } = require('../controllers/tematica');
const authMiddleware = require('../middleware/session');

router.get("/", getItems);

router.get("/all", authMiddleware(["all"]), getAllTematicas);

router.get("/id/:_id", authMiddleware(["all"]), validatorID, getItem);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorID, patchItem);

router.delete("/:_id", authMiddleware(["all"]), validatorID , deleteItem);

module.exports = router;
