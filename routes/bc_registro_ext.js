const express = require('express');
const router = express.Router();
const { validatorCreateRegistoExt, validatorGetUser } = require('../validators/registroextValidators');
const { getItems, createItem, getItem, updateItem} = require('../controllers/registro');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:idUser", authMiddleware(["all"]), validatorGetUser, getItem);

router.post("/registrar", authMiddleware(["all"]), validatorCreateRegistoExt, createItem);

router.post("/updateEstado", authMiddleware(["all"]), validatorGetUser, updateItem);

module.exports = router;