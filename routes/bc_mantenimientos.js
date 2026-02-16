const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { 
    getMantenimientos, 
    getMantenimientoPorId, 
    getMantenimientosPorEstacion,
    getMantenimientosPorEmpresa,
    getMantenimientosPorBicicleta,
    crearMantenimiento, 
    actualizarMantenimiento, 
    finalizarMantenimiento,
    cancelarMantenimiento,
    getMantenimientosPorOperario,
    getComponentesConCategorias,
    crearMantenimientosMasivo,
    actualizarHistorialComponente,
    crearHistorialComponente,
    getEstadisticasOperarios,
    getEstadisticasOperariosByEstacion,
    getEstadisticasOperariosByEmpresa,
    getRendimientoOperarios,
    getComponentesPorBicicleta,
    trasladoMasivoMantenimientos,
    getHistorialMantenimiento,
    exportMantenimientosPorEmpresa,
    exportMantenimientosPorEstacion
} = require('../controllers/mantenimientos');

const {
    validatorCreateMantenimiento,
    validatorGetMantenimiento,
    validatorPatchMantenimiento,
    validatorFinalizarMantenimiento,
    validatorGetPorEstacion,
    validatorGetPorEmpresa,
    validatorGetPorBicicleta,
    validatorGetPorOperario,
    validatorCreateMantenimientosMasivo,
    validatorUpdateHistorial,
    validatorCreateHistorial,
        validatorGetEstadisticasOperario,
    validatorGetRendimientoOperarios,
    validatorTrasladoMasivo,
    validatorGetHistorial
} = require('../validators/mantenimientosValidators');

// Obtener todos los mantenimientos
router.get("/", getMantenimientos);

// Obtener mantenimiento por ID
router.get("/id/:id", authMiddleware(["all"]), validatorGetMantenimiento, getMantenimientoPorId);

// Obtener mantenimientos por estación
router.get("/estacion/:estacion_id", authMiddleware(["all"]), validatorGetPorEstacion, getMantenimientosPorEstacion);

// Obtener mantenimientos por empresa
router.get("/empresa/:empresa_id", authMiddleware(["all"]), validatorGetPorEmpresa, getMantenimientosPorEmpresa);

// Obtener mantenimientos por bicicleta
router.get("/bicicleta/:bicicleta_id", authMiddleware(["all"]), validatorGetPorBicicleta, getMantenimientosPorBicicleta);

// Crear nuevo mantenimiento
router.post("/", authMiddleware(["all"]), validatorCreateMantenimiento, crearMantenimiento);

// Actualizar mantenimiento
router.patch("/:id", authMiddleware(["all"]), validatorPatchMantenimiento, actualizarMantenimiento);

// Finalizar mantenimiento
router.patch("/finalizar/:id", authMiddleware(["all"]), validatorFinalizarMantenimiento, finalizarMantenimiento);

// Cancelar mantenimiento
router.patch("/cancelar/:id", authMiddleware(["all"]), validatorGetMantenimiento, cancelarMantenimiento);

//Buscar mantenimientos por operario
router.get("/operario/:operario_id", authMiddleware(["all"]), validatorGetPorOperario, getMantenimientosPorOperario);

router.patch("/historial/:historial_id", authMiddleware(["all"]), validatorUpdateHistorial, actualizarHistorialComponente);


router.get("/componentes-categorias", authMiddleware(["all"]), getComponentesConCategorias);

router.post("/masivo", authMiddleware(["all"]), validatorCreateMantenimientosMasivo, crearMantenimientosMasivo);

router.post("/historial", authMiddleware(["all"]), validatorCreateHistorial, crearHistorialComponente);

router.get("/bicicleta/:bicicleta_id/componentes", authMiddleware(["all"]), validatorGetPorBicicleta, getComponentesPorBicicleta);

router.post("/traslado-masivo", authMiddleware(["all"]), validatorTrasladoMasivo, trasladoMasivoMantenimientos);

router.get('/historial/:mantenimiento_id', authMiddleware(["all"]), validatorGetHistorial, getHistorialMantenimiento);

//exportaciones
router.get("/export/empresa/:empresa_id", authMiddleware(["all"]), validatorGetPorEmpresa, exportMantenimientosPorEmpresa);
router.get("/export/estacion/:estacion_id", authMiddleware(["all"]), validatorGetPorEstacion, exportMantenimientosPorEstacion);


// Endpoints para estadísticas de operarios
router.get("/operarios/estadisticas", authMiddleware(["all"]), getEstadisticasOperarios);
router.get("/operarios/rendimiento", authMiddleware(["all"]), validatorGetRendimientoOperarios, getRendimientoOperarios);
router.get("/operarios/estadisticas/empresa/:empresaId", authMiddleware(["all"]), getEstadisticasOperariosByEmpresa);
router.get("/operarios/estadisticas/estacion/:estacionId", authMiddleware(["all"]), getEstadisticasOperariosByEstacion);

module.exports = router;