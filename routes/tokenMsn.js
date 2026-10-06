const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { validatorId, validatorDocumentToken, validatorEmailToken } = require('../validators/compartidoValidators');
const { 
  getItems, getItem, createItem, patchItem, deleteItem, 
  getItemDocument, getItemEmail, getNotificationUsersByOrganization, 
  sendNotificationMessage, getNotificationHistory,
  createScheduledNotification, getScheduledNotifications, deleteScheduledNotification,
  notificarLiberacionPrestamo
} = require('../controllers/tokenMsn');

// Middleware para autorizar llamadas desde servicios internos (n8n) o con JWT de sesión
const serviceAuthMiddleware = (req, res, next) => {
  const serviceToken = req.headers['x-service-token'] || req.headers['x-api-key'];
  const expectedSecret = process.env.SERVICE_TOKEN || 'n8n-ride-service-key';
  
  if (serviceToken && (serviceToken === expectedSecret || serviceToken === process.env.JWT_SECRET)) {
    return next();
  }
  
  if (req.headers.authorization) {
    return authMiddleware(["all"])(req, res, next);
  }
  
  return res.status(401).json({ success: false, error: 'UNAUTHORIZED_SERVICE' });
};

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

// Notificación de liberación de vehículo desde n8n
router.post("/notificar-liberacion-prestamo", serviceAuthMiddleware, notificarLiberacionPrestamo);

// Programación de notificaciones
router.post("/programar", authMiddleware(["all"]), createScheduledNotification);
router.get("/programadas/:organizationId", authMiddleware(["all"]), getScheduledNotifications);
router.delete("/programar/:id", authMiddleware(["all"]), deleteScheduledNotification);

module.exports = router;
