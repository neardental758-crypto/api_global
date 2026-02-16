const express = require('express');
const router = express.Router();
const {
    validatorCreatePermiso,
    validatorGetPermiso,
    validatorUpdatePermiso
} = require('../validators/permisosValidators');
const {
    getItems,
    getItem,
    getByTipo,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/permisos');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(['all']), getItems);

router.get("/id/:per_id", authMiddleware(['all']), validatorGetPermiso, getItem);

router.get("/tipo/:per_tipo", authMiddleware(['all']), getByTipo);

router.post("/", authMiddleware(['all']), validatorCreatePermiso, createItem);

router.patch("/:per_id", authMiddleware(['all']), validatorUpdatePermiso, updateItem);

router.delete("/:per_id", authMiddleware(['all']), validatorGetPermiso, deleteItem);

module.exports = router;