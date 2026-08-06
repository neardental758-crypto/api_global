const express = require('express');
const router = express.Router();
const { 
    getModulos, 
    getModuloDetalle, 
    finalizarModulo,
    getAdminModulos,
    crearModulo,
    actualizarModulo,
    eliminarModulo,
    getAdminPreguntas,
    crearPregunta,
    actualizarPregunta,
    eliminarPregunta,
    getAdminReportes
} = require('../controllers/introduccionMovilidad');
const authMiddleware = require('../middleware/session');

// --- Rutas Cliente App ---
router.get("/modulos", authMiddleware(["all"]), getModulos);
router.get("/modulos/:id", authMiddleware(["all"]), getModuloDetalle);
router.post("/modulos/:id/finalizar", authMiddleware(["all"]), finalizarModulo);

// --- Rutas Administración ---
router.get("/admin/modulos", authMiddleware(["all"]), getAdminModulos);
router.post("/admin/modulos", authMiddleware(["all"]), crearModulo);
router.put("/admin/modulos/:id", authMiddleware(["all"]), actualizarModulo);
router.delete("/admin/modulos/:id", authMiddleware(["all"]), eliminarModulo);

router.get("/admin/modulos/:id_modulo/preguntas", authMiddleware(["all"]), getAdminPreguntas);
router.post("/admin/preguntas", authMiddleware(["all"]), crearPregunta);
router.put("/admin/preguntas/:id", authMiddleware(["all"]), actualizarPregunta);
router.delete("/admin/preguntas/:id", authMiddleware(["all"]), eliminarPregunta);

router.get("/admin/reportes", authMiddleware(["all"]), getAdminReportes);

module.exports = router;
