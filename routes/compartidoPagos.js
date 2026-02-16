const express = require('express');
const router = express.Router();
const { validatorIdPagos, validatorRegisterPago, validatorIdViaje } = require('../validators/compartidoValidators');
const { getItems, getItem, createItem, updateItem, patchItem, deleteItem, getItemsTrip } = require('../controllers/compartidoPagos');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);//ok

router.get("/id/:_id", authMiddleware(["all"]), validatorIdPagos, getItem);//ok

router.get("/idviaje/:idViaje", authMiddleware(["all"]), validatorIdViaje, getItemsTrip);//ok

router.post("/registrar", authMiddleware(["all"]), validatorRegisterPago, createItem);//ok

router.patch("/:_id", authMiddleware(["all"]), validatorIdPagos, patchItem);//ok

router.delete("/:_id", authMiddleware(["all"]), validatorIdPagos, deleteItem);//ok

module.exports = router;