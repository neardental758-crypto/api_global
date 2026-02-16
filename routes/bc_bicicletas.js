const express = require('express');
const router = express.Router();
const { validatorCreateBicycle, validatorGetBicycle, validatorGetNombre,
     validatorUpdateBicycle, validatorGetNumero, validatorGetEmpresa, validatorPatchBicycle, validatorGetEstacion,
     validatorGetPorEstado, validatorGetPorEstadoYEstacion, validatorGetPorEstadoYEmpresa,validatorGetPorBicicleta,
    } = require('../validators/bicicletasValidators');
const { getItems, createItem, getItem, getItemEstacion, getItemFlota, updateItem, getItemNumero, getItemsFilterToBicicleteros, getBicisEmpresa, patchItem, getItems_cortezza,
     get_id_cortezza, getItemEstacion_cortezza, getItemFlota_cortezza, getBicisByEstacion,
     getBicicletasPorEstado, getBicicletasPorEstadoYEstacion, getBicicletasPorEstadoYEmpresa, getMantenimientosPorBicicleta,updateEstadoDash,syncBikesStates,getBikeMetrics
} = require('../controllers/bicicletas');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/bicicletero/", authMiddleware(["all"]), getItemsFilterToBicicleteros);

router.get("/id/:bic_id", authMiddleware(["all"]), validatorGetBicycle, getItem);

router.get("/numeroVehiculo/:bic_numero", authMiddleware(["all"]), validatorGetNumero, getItemNumero);

router.post("/registrarbicicleta", authMiddleware(["all"]), validatorCreateBicycle, createItem);

router.post("/updateEstado", authMiddleware(["all"]), validatorUpdateBicycle, updateItem);
router.put("/updateEstadoDash", authMiddleware(["all"]), validatorUpdateBicycle, updateEstadoDash);

router.get("/estacion/:bic_estacion", authMiddleware(["all"]), validatorGetNombre, getItemEstacion);

router.get("/flota/:bic_estacion", authMiddleware(["all"]), validatorGetNombre, getItemFlota);

router.get("/empresa/:empresaId", authMiddleware(["all"]), validatorGetEmpresa, getBicisEmpresa);

router.get("/estacion/:est_estacion",authMiddleware(["all"]), validatorGetEstacion, getBicisByEstacion);

router.patch("/:bic_id", authMiddleware(["all"]), validatorPatchBicycle, patchItem);

// Obtener mantenimientos por bicicleta
router.get("/bicicleta/:bicicletaId", authMiddleware(["all"]), validatorGetPorBicicleta, getMantenimientosPorBicicleta);

router.put("/sync-states", authMiddleware(["all"]), syncBikesStates);

router.get("/metrics/empresa/:empresaId", authMiddleware(["all"]), validatorGetEmpresa, getBikeMetrics);



// Flota Activa o disponible
router.get("/estado", authMiddleware(["all"]),validatorGetPorEstado, getBicicletasPorEstado);
router.get("/estacion/:estacion/estado" ,authMiddleware(["all"]), validatorGetPorEstadoYEstacion, getBicicletasPorEstadoYEstacion);
router.get("/empresa/:empresaId/estado",authMiddleware(["all"]), validatorGetPorEstadoYEmpresa, getBicicletasPorEstadoYEmpresa);


//Router cortezza
router.get("/all", authMiddleware(["external"]), getItems_cortezza);
router.get("/id_cortezza/:bic_id", authMiddleware(["external"]), validatorGetBicycle, get_id_cortezza);
router.get("/estacion_cortezza/:bic_estacion", authMiddleware(["external"]), validatorGetNombre, getItemEstacion_cortezza);
router.get("/flota_cortezza/:bic_estacion", authMiddleware(["external"]), validatorGetNombre, getItemFlota_cortezza);
module.exports = router;
