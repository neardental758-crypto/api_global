const express = require('express');
const router = express.Router();
const { validatorCreate, validatorGet } = require('../validators/tipoVPValidators');
const { getItems, createItem, getItem} = require('../controllers/tipoVP');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:tip_id", authMiddleware(["all"]), validatorGet, getItem);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

module.exports = router;