const express = require('express');
const router = express.Router();
const { validatorCreateProgresoLogro, validatorGetProgresoLogro, validatorGetPro_logro_update, validatorGetPro_logro, validatorGetEstado, validatorGetUsuario, validatorGetEmp} = require('../validators/progresoLogrosValidators');
const { getItems, createItem, getItem,  updateItem,  patchItem, getItemByState, getItemUsuario, updateItemState, getLogroProgreso, patchLogroProgreso, getItemsByEmpresa} = require('../controllers/progresoLogros');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:id", authMiddleware(["all"]),  validatorGetProgresoLogro, getItem);
router.get("/usuario_id/:usuario_id", authMiddleware(["all"]), validatorGetUsuario, getItemUsuario);
router.post("/logro_progreso", validatorGetPro_logro, getLogroProgreso);
router.get("/estado/:estado", authMiddleware(["all"]), validatorGetEstado, getItemByState);
router.post("/registrar", authMiddleware(["all"]), validatorCreateProgresoLogro, createItem);
router.get("/empresa/:empresa", authMiddleware(["all"]), validatorGetEmp, getItemsByEmpresa);
// router.put("/", updateItem);
// router.put("/updateEstado", updateItemState);
router.patch("/:id", validatorGetPro_logro_update, patchItem);
router.patch("/usuario/:usuario_id/logro/:logro_id", validatorGetProgresoLogro, patchLogroProgreso);
router.put("/updateState", authMiddleware(["all"]), validatorGetProgresoLogro);

module.exports = router;