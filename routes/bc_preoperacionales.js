const express = require('express');
const router = express.Router();
const { validatorCreate, validatorGetTrip, validatorGetId, validatorGetUser, validatorGetPrestamos} = require('../validators/preoperacionalesValidators');
const { getItems, getItemTrip, getItemsUser, createItem, deleteItem, patchItem, getItemsWithPrestamos, getItemWithPrestamo, getItemsWithPrestamosByEmpresa, getPreoperacionalesByPrestamosIds} = require('../controllers/preoperacionales');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/trip/:idViaje", authMiddleware(["all"]), validatorGetTrip, getItemTrip);

router.get("/usuario/:usuario", authMiddleware(["all"]), validatorGetUser, getItemsUser);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

router.patch("/:id", authMiddleware(["all"]), validatorGetTrip, patchItem);

router.post("/by-prestamos", authMiddleware(["all"]), validatorGetPrestamos, getPreoperacionalesByPrestamosIds);

//Nuevos
router.get("/with-prestamos",  authMiddleware(["all"]), getItemsWithPrestamos);
router.get("/with-prestamos/:id",  authMiddleware(["all"]), validatorGetId, getItemWithPrestamo);
router.get("/with-prestamos/empresa/:empresaId", authMiddleware(["all"]), getItemsWithPrestamosByEmpresa);


module.exports = router;