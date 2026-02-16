const express = require('express');
const router = express.Router();
const { validatorCreate, validatorGet } = require('../validators/ticketsValidators');
const { getItems, getItem, createItem, updateItem, deleteItem } = require('../controllers/tickets');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:tic_id", authMiddleware(["all"]), validatorGet, getItem);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

module.exports = router;