const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { validatorId, validatorIdVehiculo } = require('../validators/compartidoValidators');
const { getItems, getItem, createItem, patchItem, deleteItem, getItemfilter } = require('../controllers/compartidoVehiculo');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/:_id", authMiddleware(["all"]),validatorIdVehiculo, getItem);

router.get("/propietario/:idpropietario", authMiddleware(["all"]), getItemfilter);

router.post("/registrar", authMiddleware(["all"]),validatorIdVehiculo, createItem);

router.patch("/:_id", authMiddleware(["all"]), validatorIdVehiculo, patchItem);

router.delete("/:_id", authMiddleware(["all"]),validatorId, deleteItem);

module.exports = router;
