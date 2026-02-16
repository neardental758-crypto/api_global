const express = require('express');
const router = express.Router();
const {
    validatorCreateRol,
    validatorGetRol,
    validatorUpdateRol
} = require('../validators/rolesValidators');
const {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/roles');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(['all']), getItems);

router.get("/id/:rol_id", authMiddleware(['all']), validatorGetRol, getItem);

router.post("/", authMiddleware(['all']), validatorCreateRol, createItem);

router.patch("/:rol_id", authMiddleware(['all']), validatorUpdateRol, updateItem);

router.delete("/:rol_id", authMiddleware(['all']), validatorGetRol, deleteItem);

module.exports = router;