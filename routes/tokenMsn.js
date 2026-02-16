const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { validatorId, validatorDocumentToken, validatorEmailToken } = require('../validators/compartidoValidators');
const { getItems, getItem, createItem, patchItem, deleteItem, getItemDocument, getItemEmail, getNotificationUsersByOrganization, sendNotificationMessage } = require('../controllers/tokenMsn');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/:_id", authMiddleware(["all"]), validatorId, getItem);

router.get("/documento/:documento", authMiddleware(["all"]), validatorDocumentToken, getItemDocument);

router.get("/email/:email", authMiddleware(["all"]), validatorEmailToken, getItemEmail);

router.post("/registrar", authMiddleware(["all"]), createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorId, patchItem);

router.delete("/:_id", authMiddleware(["all"]), validatorId, deleteItem);

router.get("/notification-users/:organizationId", authMiddleware(["all"]), getNotificationUsersByOrganization);
router.post("/send-notification-message", authMiddleware(["all"]), sendNotificationMessage);

module.exports = router;
