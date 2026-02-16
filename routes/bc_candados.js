const express = require('express');
const router = express.Router();
const {
    validatorCreateCandado,
    validatorGetCandado,
    validatorGetByImei,
    validatorUpdateCandado
} = require('../validators/candadosValidators');
const {
    getItems,
    getItem,
    getItemByImei,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/candado');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(['all']), getItems);

router.get("/id/:can_id", authMiddleware(['all']), validatorGetCandado, getItem);

router.get("/imei/:can_imei", authMiddleware(['all']), validatorGetByImei, getItemByImei);

router.post("/", authMiddleware(['all']), validatorCreateCandado, createItem);

router.patch("/:can_id", authMiddleware(['all']), validatorUpdateCandado, updateItem);

router.delete("/:can_id", authMiddleware(['all']), validatorGetCandado, deleteItem);

module.exports = router;