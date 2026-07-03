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
            let openingTime = "06:00";
            let closingTime = "22:00";
            if (station.est_horario) {
                const parts = station.est_horario.split(/ a | to |-/i);
                if (parts.length >= 2) {
                    openingTime = parts[0].trim();
                    closingTime = parts[1].trim();
                } else {
                    openingTime = station.est_horario.trim();
                }
            }

            return {
                id: station.est_id ? String(station.est_id) : "",
                name: station.est_estacion || "",
                electricBikes: station.est_electrica || 0,
                mechanicBikes: 0,
                cargoBikes: 0,
                expectedDemand: 0,
                bikesCapacity: station.est_num_bicicleteros || 0,
                address: station.est_direccion || "",
                state: station.est_habilitada === 1 ? "active" : "inactive",
                openingTime: openingTime,
                closingTime: closingTime,
                latitude: station.est_latitud !== null && station.est_latitud !== undefined ? String(station.est_latitud) : "",
                longitude: station.est_longitud !== null && station.est_longitud !== undefined ? String(station.est_longitud) : ""
            };
        });
        
        res.status(200).json(mappedStations);
    } catch (error) {
        console.error("Error in GET /api/stations:", error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authMiddleware(["all"]), async (req, res) => {
    try {
        const body = req.body;
        const opening = body.openingTime || "06:00";
        const closing = body.closingTime || "22:00";
        
        const organization = await Empresa.findByPk(body.organizationId);
        const organizationName = organization && organization.emp_nombre ? organization.emp_nombre : body.organizationId;

        const createData = {
            est_estacion: body.name || "",
            est_direccion: body.address || "",
            est_num_bicicleteros: body.bikesCapacity || 0,
            est_habilitada: (body.state === true || body.state === "active" || body.state === "true") ? 1 : 0,
            est_latitud: parseFloat(body.latitude) || 0.0,
            est_longitud: parseFloat(body.longitude) || 0.0,
            est_horario: `${opening} a ${closing}`,
            est_empresa: organizationName,
            est_mac: "00:00:00:00:00:00",
            est_electrica: 0,
            est_last_conect: "",
            est_puestos_intercambiables: 0,
            est_ciudad: "Monteria",
            est_automatizada: 0
        };

        const newStation = await Estacion.create(createData);
        res.status(200).json(newStation);
    } catch (error) {
        console.error("Error in POST /api/stations:", error);
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id', authMiddleware(["all"]), async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        
        const station = await Estacion.findByPk(id);
        if (!station) {
            return res.status(404).json({ error: "Estación no encontrada" });
        }
        
        const updateData = {};
        if (body.name !== undefined) updateData.est_estacion = body.name;
        if (body.address !== undefined) updateData.est_direccion = body.address;
        if (body.bikesCapacity !== undefined) updateData.est_num_bicicleteros = body.bikesCapacity;
        if (body.state !== undefined) updateData.est_habilitada = (body.state === true || body.state === "active" || body.state === "true") ? 1 : 0;
        if (body.latitude !== undefined) updateData.est_latitud = parseFloat(body.latitude);
        if (body.longitude !== undefined) updateData.est_longitud = parseFloat(body.longitude);
        if (body.openingTime !== undefined || body.closingTime !== undefined) {
            const opening = body.openingTime !== undefined ? body.openingTime : (station.est_horario ? station.est_horario.split(/ a | to |-/i)[0] : "06:00");
            const closing = body.closingTime !== undefined ? body.closingTime : (station.est_horario && station.est_horario.split(/ a | to |-/i)[1] ? station.est_horario.split(/ a | to |-/i)[1] : "22:00");
            updateData.est_horario = `${opening} a ${closing}`;
        }

        await Estacion.update(updateData, {
            where: { est_id: id }
        });
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in PATCH /api/stations/:id:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
