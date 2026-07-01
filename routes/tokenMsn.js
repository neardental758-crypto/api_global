const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { validatorId, validatorDocumentToken, validatorEmailToken } = require('../validators/compartidoValidators');
const { 
  getItems, getItem, createItem, patchItem, deleteItem, 
  getItemDocument, getItemEmail, getNotificationUsersByOrganization, 
  sendNotificationMessage, getNotificationHistory,
  createScheduledNotification, getScheduledNotifications, deleteScheduledNotification
} = require('../controllers/tokenMsn');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/:_id", authMiddleware(["all"]), validatorId, getItem);

router.get("/documento/:documento", authMiddleware(["all"]), validatorDocumentToken, getItemDocument);

router.get("/email/:email", authMiddleware(["all"]), validatorEmailToken, getItemEmail);

router.post("/registrar", authMiddleware(["all"]), createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorId, patchItem);

router.delete("/:_id", authMiddleware(["all"]), validatorId, deleteItem);

router.get("/notification-users/:organizationId", authMiddleware(["all"]), getNotificationUsersByOrganization);
router.post("/send-notification-message", authMiddleware(["all"]), sendNotificationMessage);
router.get("/historial/:organizationId", authMiddleware(["all"]), getNotificationHistory);

// Programación de notificaciones
router.post("/programar", authMiddleware(["all"]), createScheduledNotification);
router.get("/programadas/:organizationId", authMiddleware(["all"]), getScheduledNotifications);
router.delete("/programar/:id", authMiddleware(["all"]), deleteScheduledNotification);

module.exports = router;
