const express = require('express');
const router = express.Router();
const { validatorCreate, validatorGet, validatorGetCod} = require('../validators/referidosValidators');
const { getItems, createItem, getItemUser, getItemCod, updateReferido } = require('../controllers/referidos');
const authMiddleware = require('../middleware/session');

router.get("/", getItems);

router.get("/usuario/:usuario", authMiddleware(['all']), validatorGet, getItemUser);

router.get("/cod/:codigo", authMiddleware(['all']), validatorGetCod, getItemCod);

router.post("/registrar", authMiddleware(['all']), validatorCreate, createItem);

router.patch("/", authMiddleware(["all"]), validatorGet, updateReferido);

module.exports = router;