const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { getNotificaciones, updateNotificacion, extenderRenta} = require('../controllers/notificaciones_rentas');

router.get("/notificaciones", authMiddleware(["all"]), getNotificaciones);
router.put("/notificaciones/update", authMiddleware(["all"]), updateNotificacion);
router.put("/notificaciones/extender", authMiddleware(["all"]), extenderRenta);

module.exports = router;