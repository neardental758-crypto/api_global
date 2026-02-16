const express = require('express');
const router = express.Router();
const { validatorCreateProgresoDesafio, validatorGetProgresoDesafio, validatorGetEstado, validatorGetUsuario} = require('../validators/progresoDesafiosValidators');
const { getItems, createItem, getItem,  updateItem,  patchItem, getItemByState, getItemUsuario, updateItemState} = require('../controllers/progresoDesafios');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:id", authMiddleware(["all"]),  validatorGetProgresoDesafio, getItem);
router.get("/usuario_id/:usuario_id", authMiddleware(["all"]), validatorGetUsuario, getItemUsuario);
router.get("/estado/:estado", authMiddleware(["all"]), validatorGetEstado, getItemByState);
router.post("/registrar", authMiddleware(["all"]), validatorCreateProgresoDesafio, createItem);
// router.put("/", updateItem);
// router.put("/updateEstado",authMiddleware(["all"]), updateItemState);
router.patch("/:id_logro", authMiddleware(["all"]), validatorGetProgresoDesafio, patchItem);
router.put("/updateState", authMiddleware(["all"]), validatorGetProgresoDesafio);

module.exports = router;