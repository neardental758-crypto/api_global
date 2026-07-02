const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const {
  getResumen,
  getProgramados,
  getHistorial,
  enviarRecordatorioManual,
  forzarMantenimiento,
  cancelarYReemplazarMantenimiento,
  ejecutarCronManual
} = require('../controllers/mantenimientoPersonalizado');

// Obtener resumen estadístico de cobertura
router.get("/resumen", authMiddleware(["all"]), getResumen);

// Obtener vehículos programados activos (pendientes/en proceso)
router.get("/programados", authMiddleware(["all"]), getProgramados);

// Obtener historial y estado general de todas las bicicletas en préstamo personalizado
router.get("/historial", authMiddleware(["all"]), getHistorial);

// Enviar notificación de recordatorio manual
router.post("/recordatorio", authMiddleware(["all"]), enviarRecordatorioManual);

// Adelantar/forzar la programación de mantenimiento de una bicicleta
router.post("/forzar-turno", authMiddleware(["all"]), forzarMantenimiento);

// Cancelar mantenimiento y elegir reemplazo
router.post("/cancelar-y-reemplazar", authMiddleware(["all"]), cancelarYReemplazarMantenimiento);

// Gatillar manualmente el cron job de selección rotativa semanal
router.post("/ejecutar-cron", authMiddleware(["all"]), ejecutarCronManual);

module.exports = router;
