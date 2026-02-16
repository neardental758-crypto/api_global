const express = require('express');
const router = express.Router();
const { validatorCreate, validatorGet } = require('../validators/comentariosValidators');
const { getItems, getItem, createItem, updateItem, deleteItem, getItemsToDate, getComentariosPorEmpresaEstacion} = require('../controllers/comentarios');
const authMiddleware = require('../middleware/session');
const checkAchievementById = require('../middleware/checkAchievementById');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/commentsFilter", authMiddleware(["all"]), getItemsToDate);

router.get("/id/:com_id", authMiddleware(["all"]), validatorGet, getItem);

router.post(
    "/registrar", 
    authMiddleware(["all"]), 
    checkAchievementById(203, "com_usuario"), 
    validatorCreate, 
    createItem
);

router.get("/empresa/:empresa_id", authMiddleware(["all"]), getComentariosPorEmpresaEstacion);
router.get("/empresa/:empresa_id/estacion/:estacion_id", authMiddleware(["all"]), getComentariosPorEmpresaEstacion);
module.exports = router;
