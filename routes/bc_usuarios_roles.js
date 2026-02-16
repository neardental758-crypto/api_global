const express = require('express');
const router = express.Router();
const {
    validatorCreateUsuarioRol,
    validatorGetUsuarioRol,
    validatorGetByUsuario,
    validatorDeleteUsuarioRol
} = require('../validators/usuariosRolesValidators');
const {
    getItems,
    getItem,
    getByUsuario,
    createItem,
    deleteItem
} = require('../controllers/usuarioRoles');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(['all']), getItems);

router.get("/id/:ur_id", authMiddleware(['all']), validatorGetUsuarioRol, getItem);

router.get("/usuario/:ur_usuario_id", authMiddleware(['all']), validatorGetByUsuario, getByUsuario);

router.post("/", authMiddleware(['all']), validatorCreateUsuarioRol, createItem);

router.delete("/:ur_id", authMiddleware(['all']), validatorDeleteUsuarioRol, deleteItem);

module.exports = router;