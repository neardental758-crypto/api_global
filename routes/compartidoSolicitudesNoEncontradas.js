const express = require('express');
const router = express.Router();
const { validatorIdSolicitudPend, validatorSolicitudNoEncontrada, validatorIdSolicitudPendPatch } = require('../validators/compartidoValidators');
const { getItems, getItem, createItem, patchItem, deleteItem, getItemsPendientes } = require('../controllers/compartidoSolicitudNoEncontrada');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:id", authMiddleware(["all"]), validatorIdSolicitudPend, getItem);

router.get("/pendientes", getItemsPendientes);

router.post("/registrar", validatorSolicitudNoEncontrada, createItem);

router.patch("/actualizar", validatorIdSolicitudPendPatch, patchItem);

router.delete("/:id", authMiddleware(["all"]), validatorIdSolicitudPend , deleteItem);

module.exports = router;