const express = require('express');
const router = express.Router();
const {
    validatorCreateCredencial,
    validatorGetCredencial,
    validatorUpdateCredencial
} = require('../validators/usuariosCredencialesValidators');
const {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/usuariosCredenciales');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(['all']), getItems);

router.get("/usuario/:uc_usuario_id", authMiddleware(['all']), validatorGetCredencial, getItem);

router.post("/", authMiddleware(['all']), validatorCreateCredencial, createItem);

router.patch("/:uc_usuario_id", authMiddleware(['all']), validatorUpdateCredencial, updateItem);

router.delete("/:uc_usuario_id", authMiddleware(['all']), validatorGetCredencial, deleteItem);

module.exports = router;