const express = require('express');
const router = express.Router();
const { validatorCreate, validatorGet, validatorUpdate, validatorGetChangeKey, validatorGetLastTen} = require('../validators/historialValidators');
const { getItems, createItem, getItem, getItemUsuario, getItemPrestamoActivo, updateItem, getItemChangeKey, getItemLastTen} = require('../controllers/historiales');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:his_id", authMiddleware(["all"]), validatorGet, getItem);

router.get("/changeKey", authMiddleware(["all"]), getItemChangeKey);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

router.put("/updateEstado", authMiddleware(["all"]), validatorUpdate, updateItem);

router.get("/lastTen/:his_bicicleta", authMiddleware(["all"]), validatorGetLastTen, getItemLastTen);

module.exports = router;