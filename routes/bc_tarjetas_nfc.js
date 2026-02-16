const express = require('express');
const router = express.Router();
const {
    validatorCreateTarjeta,
    validatorGetTarjeta,
    validatorGetByHexadecimal,
    validatorGetByUsuario,
    validatorUpdateTarjeta
} = require('../validators/tarjetasNfcValidators');
const {
    getItems,
    getItem,
    getByHexadecimal,
    getByUsuario,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/tarjetasNfc');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(['all']), getItems);

router.get("/id/:tnfc_id", authMiddleware(['all']), validatorGetTarjeta, getItem);

router.get("/hexadecimal/:tnfc_id_hexadecimal", authMiddleware(['all']), validatorGetByHexadecimal, getByHexadecimal);

router.get("/usuario/:tnfc_usuario_id", authMiddleware(['all']), validatorGetByUsuario, getByUsuario);

router.post("/", authMiddleware(['all']), validatorCreateTarjeta, createItem);

router.patch("/:tnfc_id", authMiddleware(['all']), validatorUpdateTarjeta, updateItem);

router.delete("/:tnfc_id", authMiddleware(['all']), validatorGetTarjeta, deleteItem);

module.exports = router;