const express = require('express');
const router = express.Router();
const { validatorCreate, validatorGetTrip, validatorGetId, validatorGetUser} = require('../validators/indicadoresValidators');
const { getItems, getItemTrip, getItemsUser, createItem, deleteItem, patchItem, getItemsWithPrestamos, getItemWithPrestamo, getItemsWithPrestamosByEmpresa} = require('../controllers/indicadoresTrip');
const authMiddleware = require('../middleware/session');
//const checkAchievementDistance = require("../middleware/checkAchievementDistance");
//const checkAchievementCO2 = require("../middleware/checkAchievementCO2");
const checkAchievement5Viajes = require("../middleware/checkAchievement5Viajes");

router.get("/", authMiddleware(["all"]), getItems);

router.get("/trip/:ind_viaje", authMiddleware(["all"]), validatorGetTrip, getItemTrip);

router.get("/usuario/:ind_usuario", authMiddleware(["all"]), validatorGetUser, getItemsUser);

router.post(
    "/registrar", 
    authMiddleware(["all"]), 
    //checkAchievementDistance(202, "ind_usuario", "ind_distancia"), // progresologro 10km
    //checkAchievementCO2(204, "ind_usuario", "ind_co2"), // progresologro co2
    checkAchievement5Viajes(205, "ind_usuario"), // progresologro 5viajes semana // tenemos que actualizar el id cada vez que se cree un logro de , 
    validatorCreate, 
    createItem
);

router.patch("/:ind_id", authMiddleware(["all"]), validatorGetTrip, patchItem);

//Nuevos
router.get("/with-prestamos",  authMiddleware(["all"]), getItemsWithPrestamos);
router.get("/with-prestamos/:ind_id",  authMiddleware(["all"]), validatorGetId, getItemWithPrestamo);
router.get("/with-prestamos/empresa/:empresaId", authMiddleware(["all"]), getItemsWithPrestamosByEmpresa);


module.exports = router;