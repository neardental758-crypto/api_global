const express = require('express');
const router = express.Router();
const { bicicletasModels, estacionModels, empresaModels } = require('../models');
const authMiddleware = require('../middleware/session');
const { Op } = require('sequelize');

// Helper to parse Loopback filter for bikes
function parseBikesFilter(req) {
    let whereClause = {};
    let filterObj = {};

    if (req.query.filter) {
        try {
            filterObj = typeof req.query.filter === 'string' ? JSON.parse(req.query.filter) : req.query.filter;
            if (filterObj.where) {
                whereClause = filterObj.where;
            }
        } catch (e) {
            console.error("Error parsing req.query.filter in bikes:", e);
        }
    }

    let numberSearchTerm = "";
    let organizationId = null;

    function traverse(obj) {
        if (!obj || typeof obj !== 'object') return;

        if (Array.isArray(obj)) {
            obj.forEach(traverse);
            return;
        }

        for (const key in obj) {
            const val = obj[key];
            if (key === 'number' && val && typeof val === 'object' && val.like !== undefined) {
                numberSearchTerm = val.like;
            } else if (key === 'organizationId') {
                if (typeof val === 'string') {
                    organizationId = val;
                }
            }
            traverse(val);
        }
    }

    traverse(whereClause);

    return { numberSearchTerm, organizationId, filterObj };
}

// Map database Sequelize Bicicleta model to Loopback JSON expected by frontend
function mapBicicletaToFrontend(bike) {
    const json = bike.toJSON ? bike.toJSON() : bike;
    return {
        id: json.bic_id,
        nombre: json.bic_nombre || "",
        number: json.bic_numero || "",
        estacion: json.bic_estacion || "",
        estado: json.bic_estado || "",
        descripcion: json.bic_descripcion || "",
        bluetooth: json.bic_bluetooth || "",
        clave: json.bic_clave || "",
        createdAt: json.bic_created_at || null,
        updatedAt: json.bic_updated_at || null
    };
}

// GET /api/bikes
router.get("/", authMiddleware(['all']), async (req, res) => {
    try {
        const { numberSearchTerm, organizationId, filterObj } = parseBikesFilter(req);

        const where = {};

        // 1. Filter by bike number
        if (numberSearchTerm) {
            where.bic_numero = { [Op.like]: `%${numberSearchTerm}%` };
        }

        // 2. Filter by organization
        if (organizationId) {
            const company = await empresaModels.findOne({ where: { emp_id: organizationId } });
            if (company) {
                const stations = await estacionModels.findAll({ where: { est_empresa: company.emp_nombre } });
                const stationNames = stations.map(s => s.est_estacion);
                where.bic_estacion = { [Op.in]: stationNames };
            } else {
                // If company doesn't exist, return empty array immediately
                return res.send([]);
            }
        }

        const limit = filterObj.limit ? parseInt(filterObj.limit) : 100;
        const skip = filterObj.skip ? parseInt(filterObj.skip) : 0;

        const data = await bicicletasModels.findAll({
            where,
            limit,
            offset: skip,
            order: [['bic_id', 'DESC']]
        });

        const mappedData = data.map(mapBicicletaToFrontend);
        res.send(mappedData);
    } catch (error) {
        console.error("Error fetching bikes compatibility layer:", error);
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
