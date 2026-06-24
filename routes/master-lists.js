const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');

router.get('/', authMiddleware(["all"]), async (req, res) => {
    try {
        let filter = {};
        if (req.query.filter) {
            filter = JSON.parse(req.query.filter);
        }
        
        const where = filter.where || {};
        let tableName = "";
        
        if (where.table) {
            tableName = typeof where.table === 'object' ? (where.table.like || "") : where.table;
        }
        
        tableName = String(tableName).toLowerCase().trim();
        
        if (tableName.includes('trips')) {
            return res.status(200).json([
                { value: "active", label: "Activo" },
                { value: "help", label: "Ayuda" },
                { value: "finishing", label: "Finalizando" },
                { value: "finished", label: "Finalizado" }
            ]);
        }
        
        if (tableName.includes('tickets')) {
            return res.status(200).json([
                { value: "created", label: "Creado" },
                { value: "solved", label: "Solucionado" }
            ]);
        }
        
        res.status(200).json([]);
    } catch (error) {
        console.error("Error in GET /api/master-lists:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
