const express = require('express');
const router = express.Router();
const {
    validatorCreate,
    validatorId,
    validatorUsuario,
   } = require('../validators/vpcomentariosValidators');
const {
    getItems,
    createItem,
    getItem,
    getItemUsuario,
    deleteItem,
    updateId
} = require('../controllers/vpcometarios');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/usuario/:vp_usuario", authMiddleware(["all"]), validatorUsuario, getItemUsuario);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

router.post("/updateEstado", authMiddleware(["all"]), validatorId, updateId);

router.post("/updateTrip", authMiddleware(["all"]), validatorId, deleteItem);

module.exports = router;