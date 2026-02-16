const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { getAgendamientos, createAgendamiento, updateAgendamiento, deleteAgendamiento,
     getAgendamientosIncumplidos, getOperarios, getEmpresasOperario, getEstacionesEmpresa,
    getIncumplidosCount, marcarIncumplidoRevisado, marcarTodosRevisados
    } = require('../controllers/agendamientos_operarios');


router.get("/agendamientos", authMiddleware(["all"]), getAgendamientos);
router.post("/agendamientos", authMiddleware(["all"]), createAgendamiento);
router.put("/agendamientos/:id", authMiddleware(["all"]), updateAgendamiento);
router.delete("/agendamientos/:id", authMiddleware(["all"]), deleteAgendamiento);
router.get("/agendamientos/incumplidos", authMiddleware(["all"]), getAgendamientosIncumplidos);
router.get("/operarios", authMiddleware(["all"]), getOperarios);
router.get("/operarios/:operario_id/empresas", authMiddleware(["all"]), getEmpresasOperario);
router.get("/empresas/:empresa_id/estaciones", authMiddleware(["all"]), getEstacionesEmpresa);

router.get("/incumplidos/count", authMiddleware(["all"]), getIncumplidosCount);
router.put("/incumplidos/:id/revisar", authMiddleware(["all"]), marcarIncumplidoRevisado);
router.put("/incumplidos/revisar-todos", authMiddleware(["all"]), marcarTodosRevisados);
router.get("/agendamientos/incumplidos", authMiddleware(["all"]), getAgendamientosIncumplidos);
module.exports = router;
