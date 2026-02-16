const express = require('express');
const router = express.Router();
const { validatorIdOficinas } = require('../validators/compartidoValidators');
const { getItems, getItem, createItem, patchItem, deleteItem } = require('../controllers/oficinas');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:_id", authMiddleware(["all"]), validatorIdOficinas, getItem);

router.post("/registrar", authMiddleware(["all"]),validatorIdOficinas, createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorIdOficinas, patchItem);

router.delete("/:_id", authMiddleware(["all"]), validatorIdOficinas , deleteItem);

module.exports = router;
