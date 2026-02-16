const express = require('express');
const router = express.Router();
const { validatorCreateLogros, validatorGetLogro, validatorGetEstado, validatorCreateLogro, validatorUpdateLogros} = require('../validators/logrosValidators');
const { getItems, createItem, getItem,  updateItem,  patchItem, getItemByState} = require('../controllers/logros');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:id_logro", authMiddleware(["all"]), validatorGetLogro, getItem);
router.get("/estado/:estado", authMiddleware(["all"]),validatorGetEstado, getItemByState);
router.post("/updateEstado", authMiddleware(["all"]), validatorGetLogro);
router.patch("/:id_logro", authMiddleware(["all"]), validatorUpdateLogros, patchItem);
router.put("/updateState", authMiddleware(["all"]), validatorGetLogro);
router.post("/registrar", authMiddleware(["all"]), validatorCreateLogro, createItem);

module.exports = router;