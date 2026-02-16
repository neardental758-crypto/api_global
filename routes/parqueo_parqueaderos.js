const express = require('express');
const router = express.Router();
const { validatorGetId, validatorGetEmpresa, validatorCreate, validatorGetEmpresaId, validatorUpdate,
    validatorCreatePuntosMasivo, validatorUpdatePuntosMasivo,validatorGetPuntosCarga,validatorGetHorarios,validatorUpdateHorariosMasivo,validatorCreateHorariosMasivo
} = require('../validators/parqueo_parqueaderos_validators');
const { getItems, createItem, getItem, getItemNombre, getItemEmpresa, getItemEmpresaId, updateItem,
     createPuntosCargaMasivo, updatePuntosCargaMasivo, getPuntosCargaByParqueadero,
     getHorariosByParqueadero, createHorariosMasivo, updateHorariosMasivo, deleteItem
 } = require('../controllers/parqueo_parqueaderos');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:id", authMiddleware(["all"]), validatorGetId, getItem);

router.get("/empresa/:empresa", validatorGetEmpresa, getItemEmpresa);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

router.get("/empresa-id/:empresaId", authMiddleware(["all"]), validatorGetEmpresaId, getItemEmpresaId);

router.put("/id/:id", authMiddleware(["all"]), validatorUpdate, updateItem);

router.get("/puntos-carga/:parqueaderoId", authMiddleware(["all"]), validatorGetPuntosCarga, getPuntosCargaByParqueadero);

router.post("/puntos-carga/masivo", authMiddleware(["all"]), validatorCreatePuntosMasivo, createPuntosCargaMasivo);

router.put("/puntos-carga/masivo", authMiddleware(["all"]), validatorUpdatePuntosMasivo, updatePuntosCargaMasivo);

router.get("/horarios/:parqueaderoId", authMiddleware(["all"]), validatorGetHorarios, getHorariosByParqueadero);
router.post("/horarios/masivo", authMiddleware(["all"]), validatorCreateHorariosMasivo, createHorariosMasivo);
router.put("/horarios/masivo", authMiddleware(["all"]), validatorUpdateHorariosMasivo, updateHorariosMasivo);


router.delete("/id/:id", authMiddleware(["all"]), validatorGetId, deleteItem);


module.exports = router;