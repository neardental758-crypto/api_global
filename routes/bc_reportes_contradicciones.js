const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { validatorCreateReporte, validatorUpdateReporte } = require('../validators/reportesContradiccionesValidators');
const { getItems, createItem, updateItem } = require('../controllers/bc_reportes_contradicciones');

// Obtener todos los reportes de contradicciones (sólo admins o usuarios autenticados)
router.get("/", authMiddleware(["all"]), getItems);

// Registrar un reporte de contradicción de estación
router.post("/registrar", authMiddleware(["all"]), validatorCreateReporte, createItem);

// Actualizar el estado de un reporte
router.put("/update", authMiddleware(["all"]), validatorUpdateReporte, updateItem);

module.exports = router;
