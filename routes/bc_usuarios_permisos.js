const express = require('express');
const router = express.Router();
const {
    validatorCreateUsuarioPermiso,
    validatorGetUsuarioPermiso,
    validatorGetByUsuario,
    validatorDeleteUsuarioPermiso
} = require('../validators/usuariosPermisosValidators');
const {
    getItems,
    getItem,
    getByUsuario,
    createItem,
    deleteItem
} = require('../controllers/usuarioPermiso');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(['all']), getItems);

router.get("/id/:up_id", authMiddleware(['all']), validatorGetUsuarioPermiso, getItem);

router.get("/usuario/:up_usuario_id", authMiddleware(['all']), validatorGetByUsuario, getByUsuario);

router.post("/", authMiddleware(['all']), validatorCreateUsuarioPermiso, createItem);

router.delete("/:up_id", authMiddleware(['all']), validatorDeleteUsuarioPermiso, deleteItem);

module.exports = router;