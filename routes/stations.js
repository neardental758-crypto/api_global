const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const Estacion = require('../models/mysql/estacion');
const Empresa = require('../models/mysql/empresa');

router.get('/', authMiddleware(["all"]), async (req, res) => {
    try {
        let filter = {};
        if (req.query.filter) {
            filter = JSON.parse(req.query.filter);
        }
        
        const extractOrgId = (f) => {
            if (!f) return null;
            const w = f.where || {};
            if (w.organizationId) return w.organizationId;
            
            // Check if there is an 'or' array
            if (Array.isArray(w.or)) {
                for (const item of w.or) {
                    if (typeof item === 'string' && item.includes('-')) {
                        return item;
                    }
                    if (typeof item === 'object' && item !== null) {
                        for (const [key, val] of Object.entries(item)) {
                            if (key.includes('-') && key.length >= 20) return key;
                            if (typeof val === 'string' && val.includes('-') && val.length >= 20) return val;
                        }
                    }
                }
            }
            
            // General deep search
            let found = null;
            const recurse = (obj) => {
                if (!obj || found) return;
                if (typeof obj === 'string') {
                    if (obj.includes('-') && obj.length >= 20) {
                        found = obj;
                    }
                    return;
                }
                if (Array.isArray(obj)) {
                    for (const el of obj) {
                        recurse(el);
                    }
                } else if (typeof obj === 'object') {
                    for (const [k, v] of Object.entries(obj)) {
                        if (k.includes('-') && k.length >= 20) {
                            found = k;
                            return;
                        }
                        recurse(v);
                    }
                }
            };
            recurse(w);
            return found;
        };

        const organizationId = extractOrgId(filter);
        
        if (!organizationId) {
            console.warn("Warning: Could not extract organizationId from filter:", JSON.stringify(filter));
            return res.status(200).json([]);
        }
        
        // Find organization name
        const organization = await Empresa.findByPk(organizationId);
        const organizationName = organization && organization.emp_nombre ? organization.emp_nombre : null;
        
        // Find stations matching organization ID or Name
        const stations = await Estacion.findAll({
            where: {
                est_empresa: organizationName ? [organizationId, organizationName] : [organizationId]
            }
        });
        
        // Map to format expected by frontend
        const mappedStations = stations.map(station => {
            return {
                id: station.est_id ? String(station.est_id) : "",
                name: station.est_estacion || "",
                electricBikes: station.est_electrica || 0,
                mechanicBikes: 0,
                cargoBikes: 0,
                expectedDemand: 0,
                bikesCapacity: station.est_num_bicicleteros || 0,
                address: station.est_direccion || "",
                state: station.est_habilitada === 1 ? "active" : "inactive"
            };
        });
        
        res.status(200).json(mappedStations);
    } catch (error) {
        console.error("Error in GET /api/stations:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
