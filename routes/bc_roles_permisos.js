const express = require('express');
const router = express.Router();
const {
    validatorCreateRolPermiso,
    validatorGetRolPermiso,
    validatorGetByRol,
    validatorDeleteRolPermiso
} = require('../validators/rolesPermisosValidators');
const {
    getItems,
    getItem,
    getByRol,
    createItem,
    deleteItem
} = require('../controllers/rolesPermisos');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(['all']), getItems);

router.get("/id/:rp_id", authMiddleware(['all']), validatorGetRolPermiso, getItem);

router.get("/rol/:rp_rol_id", authMiddleware(['all']), validatorGetByRol, getByRol);

router.post("/", authMiddleware(['all']), validatorCreateRolPermiso, createItem);

router.delete("/:rp_id", authMiddleware(['all']), validatorDeleteRolPermiso, deleteItem);

module.exports = router;