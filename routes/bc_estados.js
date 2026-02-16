const express = require('express');
const router = express.Router();
const { validatorCreateEstados, validatorGetEstado } = require('../validators/estadosValidators');
const { getItems, getItem, createItem, updateItem, deleteItem} = require('../controllers/estados');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:est_id", authMiddleware(["all"]), validatorGetEstado, getItem);

router.post("/registrar", authMiddleware(["all"]), validatorCreateEstados, createItem);

module.exports = router;