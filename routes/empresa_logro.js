const express = require('express');
const router = express.Router();
const { validatorCreateLogros, validatorGetLogro, validatorGetEstado, validatorGetLogroEmp, validatorCreateItem, validatorUpdateLogros} = require('../validators/empresalogroValidators');
const { getItems, createItem, getItem,  updateItem, getItemtoEmpresa, patchItem, getItemByState, getItemtoEmpresaWithLogro} = require('../controllers/empresalogro');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/logro/:idLogro/empresa/:idEmpresa", authMiddleware(["all"]), validatorGetLogro, getItem);
router.get("/empresa/:idEmpresa", validatorGetLogroEmp, getItemtoEmpresa);
router.get("/estado/:estado", authMiddleware(["all"]),validatorGetEstado, getItemByState);
router.post("/updateEstado",  authMiddleware(["all"]), validatorGetLogro);
router.patch("/:id",  authMiddleware(["all"]), validatorUpdateLogros, patchItem);
router.put("/updateState",  authMiddleware(["all"]), validatorGetLogro);
router.post("/registrar", authMiddleware(["all"]), validatorCreateItem, createItem);
router.get("/empresa/:idEmpresa/dashboard", authMiddleware(["all"]), validatorGetLogroEmp, getItemtoEmpresaWithLogro);

module.exports = router;