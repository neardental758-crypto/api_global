const express = require('express');
const router = express.Router();
const { 
    validatorCreatePush, 
    validatorCreatePushMultiple 
} = require('../validators/pushValidators');
const { 
    enviarPush, 
    enviarPushMultiple 
} = require('../controllers/push');

// Ruta de prueba para verificar que el módulo carga
router.get("/test", (req, res) => {
    res.json({ message: "Módulo de notificaciones funcionando" });
});

// Enviar a un solo dispositivo
router.post("/enviar", validatorCreatePush, enviarPush);

// Enviar a múltiples dispositivos
router.post("/enviar-multiple", validatorCreatePushMultiple, enviarPushMultiple);

module.exports = router;