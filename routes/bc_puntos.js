const express = require('express');
const router = express.Router();
const { validatorCreatePuntos, validatorGetUser, validatorGetEmpresa } = require('../validators/puntosValidators');
const { getItems, createItem, getItem, getItemUsuario, getItemUsuario_cortezza, correo__recompensas, getRecompensasByEmpresa, updateEstadoRecompensa } = require('../controllers/puntos');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/usuario/:pun_usuario", authMiddleware(["all"]), validatorGetUser, getItemUsuario);

router.post("/registrar", authMiddleware(["all"]), validatorCreatePuntos, createItem);
router.post("/correo_recompensas", correo__recompensas);

router.get("/empresa/:empresa", authMiddleware(["all"]), validatorGetEmpresa, getRecompensasByEmpresa);
router.put("/estado", authMiddleware(["all"]), updateEstadoRecompensa);
//Router cortezza
router.get("/usuario_cortezza/:pun_usuario", authMiddleware(["external"]), validatorGetUser, getItemUsuario_cortezza);

module.exports = router;