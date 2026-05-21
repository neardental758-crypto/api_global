const express = require('express');
const router = express.Router();
const { openLockByImei } = require('../controllers/openLock');
const authMiddleware = require('../middleware/session');

/**
 * GET /api/openLock/:imei
 * Protegido con authMiddleware para asegurar que solo usuarios autenticados
 * puedan solicitar la apertura remota de los candados.
 */
router.get("/:imei", authMiddleware(['all']), openLockByImei);

module.exports = router;



