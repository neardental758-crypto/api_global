const express = require('express');
const router = express.Router();
const { 
    getClients, 
    getMetrics, 
    saveDraft, 
    publishReport 
} = require('../controllers/sivuc');

// Catálogo de empresas y programas soportados
router.get('/clients', getClients);

// Métricas propuestas (Ride SQL + históricos + cálculo de impacto)
router.get('/metrics', getMetrics);

// Guardado y recuperación de borradores para Vanessa
router.post('/draft', saveDraft);

// Publicación de informe final
router.post('/publish', publishReport);

module.exports = router;
