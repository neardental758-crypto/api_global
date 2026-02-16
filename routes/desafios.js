const express = require('express');
const router = express.Router();
const { validatorCreateDesafios, validatorGetDesafio, validatorGetEstado} = require('../validators/desafiosValidators');
const { getItems, createItem, getItem,  updateItem,  patchItem, getItemByState, updateItemState} = require('../controllers/desafios');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);
router.get("/id/:id_desafio",authMiddleware(["all"]),  validatorGetDesafio, getItem);
router.get("/estado/:estado",authMiddleware(["all"]), validatorGetEstado, getItemByState);
router.put("/updateEstado",authMiddleware(["all"]), updateItemState);
router.patch("/:id_desafio", authMiddleware(["all"]), validatorGetDesafio, patchItem);
router.put("/updateState", authMiddleware(["all"]), validatorGetDesafio);

module.exports = router;