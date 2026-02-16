const express = require('express');
const router = express.Router();
const { getItems, createItem, getItem, patchItem, getActivePractise, sendApprovalEmail } = require('../controllers/agendamientoUsuario');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:_id", authMiddleware(["all"]), getItem);

router.get("/activeUser/:_id", authMiddleware(["all"]), getActivePractise);

router.patch("/:_id", authMiddleware(["all"]), patchItem);

router.post("/registrar", authMiddleware(["all"]), createItem);

router.post("/send-approval-email", authMiddleware(["all"]), sendApprovalEmail);


module.exports = router;