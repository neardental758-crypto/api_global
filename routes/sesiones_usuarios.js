const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/session");
const { validatorCreateSession, validatorCloseSession } = require("../validators/sesiones_usuariosValidators");
const { createSession, closeSession } = require("../controllers/sesiones_usuarios");

router.post("/create", authMiddleware(["all"]), validatorCreateSession, createSession);
router.patch("/close", authMiddleware(["all"]), validatorCloseSession, closeSession);
module.exports = router;