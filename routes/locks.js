const express = require('express');
const router = express.Router();
const { candadosModels, bicicletasModels, estacionModels, empresaModels } = require('../models');
const authMiddleware = require('../middleware/session');
const { Op } = require('sequelize');

// Helper function to extract organizationId and searchTerm from Loopback queries
function parseLoopbackQuery(req) {
    let whereClause = {};
    let filterObj = {};

    if (req.query.where) {
        try {
            whereClause = typeof req.query.where === 'string' ? JSON.parse(req.query.where) : req.query.where;
        } catch (e) {
            console.error("Error parsing req.query.where:", e);
        }
    }

    if (req.query.filter) {
        try {
            filterObj = typeof req.query.filter === 'string' ? JSON.parse(req.query.filter) : req.query.filter;
            if (filterObj.where) {
                whereClause = filterObj.where;
            }
        } catch (e) {
            console.error("Error parsing req.query.filter:", e);
        }
    }

    let searchTerm = "";
    let organizationId = null;
    let locksWithoutBikeState = false;
    let bikesIds = [];

    // Helper to traverse and extract filters recursively
    function traverse(obj) {
        if (!obj || typeof obj !== 'object') return;

        if (Array.isArray(obj)) {
            obj.forEach(traverse);
            return;
        }

        for (const key in obj) {
            const val = obj[key];
            if (key === 'qrNumber' && val && typeof val === 'object' && val.like !== undefined) {
                searchTerm = val.like;
            } else if (key === 'imei' && val && typeof val === 'object' && val.like !== undefined) {
                searchTerm = val.like;
            } else if (key === 'bikeId') {
                if (val && typeof val === 'object' && val.inq) {
                    bikesIds = val.inq;
                } else if (val && Array.isArray(val.inq)) {
                    bikesIds = val.inq;
                }
            } else if (key === 'organizationId') {
                if (typeof val === 'string') {
                    organizationId = val;
                } else if (val && val.inq) {
                    // Skip null/undefined array filters
                }
            } else if (key === 'locksWithoutBikeState' || key === 'bikeId') {
                if (val && typeof val === 'object' && val.inq && val.inq.includes(null)) {
                    locksWithoutBikeState = true;
                }
            }
            traverse(val);
        }
    }

    traverse(whereClause);

    // Fallback if searchTerm was passed directly in filter
    if (!searchTerm && req.query.searchTerm) {
        searchTerm = req.query.searchTerm;
    }

    return { searchTerm, organizationId, locksWithoutBikeState, bikesIds, filterObj };
}

// Map database Sequelize Candado model to Loopback JSON expected by frontend
async function mapCandadoToFrontend(candado) {
    const json = candado.toJSON ? candado.toJSON() : candado;
    
    const mapped = {
        id: json.can_id,
        imei: json.can_imei,
        qrNumber: json.can_qr_numero || "",
        mac: json.can_mac || "",
        battery: json.can_bateria !== undefined ? String(json.can_bateria) : "0",
        lockStatus: json.can_estado_candado || "closed",
        signal: json.can_senal !== undefined ? String(json.can_senal) : "0",
        simNumber: json.can_numero_sim || "",
        lastCommandDate: json.can_fecha_ultimo_comando || null,
        lastCommand: json.can_ultimo_comando || "",
        bikeId: json.can_bicicleta || null,
        bike: null,
        organization: {
            id: "",
            name: "Ninguna"
        }
    };

    if (json.bike) {
        mapped.bike = {
            id: json.bike.bic_id,
            nombre: json.bike.bic_nombre,
            number: json.bike.bic_numero,
            estacion: json.bike.bic_estacion,
            estado: json.bike.bic_estado,
            descripcion: json.bike.bic_descripcion
        };

        // Try to fetch organization name from station
        if (json.bike.bic_estacion) {
            try {
                const station = await estacionModels.findOne({
                    where: { est_estacion: json.bike.bic_estacion }
                });
                if (station && station.est_empresa) {
                    mapped.organization.name = station.est_empresa;
                    // Find company ID if possible
                    const company = await empresaModels.findOne({
                        where: { emp_nombre: station.est_empresa }
                    });
                    if (company) {
                        mapped.organization.id = company.emp_id;
                    }
                }
            } catch (err) {
                console.error("Error retrieving company/station for lock mapping:", err);
            }
        }
    }

    return mapped;
}

// GET /api/locks/count
router.get("/count", authMiddleware(['all']), async (req, res) => {
    try {
        const { searchTerm, organizationId, locksWithoutBikeState, bikesIds } = parseLoopbackQuery(req);

        let where = {};

        // 1. If unassigned locks filter is true
        if (locksWithoutBikeState) {
            where[Op.or] = [
                { can_bicicleta: null },
                { can_bicicleta: 0 },
                { can_bicicleta: '' }
            ];
        }

        // 2. Search term filters (QR, IMEI, MAC or Bike IDs)
        if (searchTerm) {
            const searchConditions = [
                { can_qr_numero: { [Op.like]: `%${searchTerm}%` } },
                { can_imei: { [Op.like]: `%${searchTerm}%` } },
                { can_mac: { [Op.like]: `%${searchTerm}%` } }
            ];
            if (bikesIds && bikesIds.length > 0) {
                searchConditions.push({ can_bicicleta: { [Op.in]: bikesIds } });
            }
            if (where[Op.or]) {
                // If we already have the locksWithoutBikeState filter, intersect them
                where = {
                    [Op.and]: [
                        { [Op.or]: where[Op.or] },
                        { [Op.or]: searchConditions }
                    ]
                };
            } else {
                where[Op.or] = searchConditions;
            }
        }

        // 3. Organization Filter
        if (organizationId) {
            const company = await empresaModels.findOne({ where: { emp_id: organizationId } });
            if (company) {
                const stations = await estacionModels.findAll({ where: { est_empresa: company.emp_nombre } });
                const stationNames = stations.map(s => s.est_estacion);
                const bikes = await bicicletasModels.findAll({ where: { bic_estacion: { [Op.in]: stationNames } } });
                const bikeIds = bikes.map(b => b.bic_id);

                const orgCondition = { can_bicicleta: { [Op.in]: bikeIds } };

                if (where[Op.and]) {
                    where[Op.and].push(orgCondition);
                } else if (where[Op.or]) {
                    where = {
                        [Op.and]: [
                            { [Op.or]: where[Op.or] },
                            orgCondition
                        ]
                    };
                } else {
                    where = orgCondition;
                }
            }
        }

        const count = await candadosModels.count({ where });
        res.send({ count });
    } catch (error) {
        console.error("Error counting locks:", error);
        res.status(500).send({ error: error.message });
    }
});

// GET /api/locks
router.get("/", authMiddleware(['all']), async (req, res) => {
    try {
        const { searchTerm, organizationId, locksWithoutBikeState, bikesIds, filterObj } = parseLoopbackQuery(req);

        let where = {};

        // 1. If unassigned locks filter is true
        if (locksWithoutBikeState) {
            where[Op.or] = [
                { can_bicicleta: null },
                { can_bicicleta: 0 },
                { can_bicicleta: '' }
            ];
        }

        // 2. Search term filters (QR, IMEI, MAC or Bike IDs)
        if (searchTerm) {
            const searchConditions = [
                { can_qr_numero: { [Op.like]: `%${searchTerm}%` } },
                { can_imei: { [Op.like]: `%${searchTerm}%` } },
                { can_mac: { [Op.like]: `%${searchTerm}%` } }
            ];
            if (bikesIds && bikesIds.length > 0) {
                searchConditions.push({ can_bicicleta: { [Op.in]: bikesIds } });
            }
            if (where[Op.or]) {
                where = {
                    [Op.and]: [
                        { [Op.or]: where[Op.or] },
                        { [Op.or]: searchConditions }
                    ]
                };
            } else {
                where[Op.or] = searchConditions;
            }
        }

        // 3. Organization Filter
        if (organizationId) {
            const company = await empresaModels.findOne({ where: { emp_id: organizationId } });
            if (company) {
                const stations = await estacionModels.findAll({ where: { est_empresa: company.emp_nombre } });
                const stationNames = stations.map(s => s.est_estacion);
                const bikes = await bicicletasModels.findAll({ where: { bic_estacion: { [Op.in]: stationNames } } });
                const bikeIds = bikes.map(b => b.bic_id);

                const orgCondition = { can_bicicleta: { [Op.in]: bikeIds } };

                if (where[Op.and]) {
                    where[Op.and].push(orgCondition);
                } else if (where[Op.or]) {
                    where = {
                        [Op.and]: [
                            { [Op.or]: where[Op.or] },
                            orgCondition
                        ]
                    };
                } else {
                    where = orgCondition;
                }
            }
        }

        // Determine limits, order, and offset
        const limit = filterObj.limit ? parseInt(filterObj.limit) : 100;
        const skip = filterObj.skip ? parseInt(filterObj.skip) : 0;
        let order = [['can_id', 'DESC']];

        if (filterObj.order && filterObj.order.length > 0) {
            const orderStr = filterObj.order[0];
            if (orderStr.includes('createdAt')) {
                order = [['can_id', orderStr.includes('DESC') ? 'DESC' : 'ASC']];
            } else if (orderStr.includes('battery')) {
                order = [['can_bateria', orderStr.includes('DESC') ? 'DESC' : 'ASC']];
            } else if (orderStr.includes('lastCommandDate')) {
                order = [['can_fecha_ultimo_comando', orderStr.includes('DESC') ? 'DESC' : 'ASC']];
            }
        }

        const data = await candadosModels.findAll({
            where,
            limit,
            offset: skip,
            order,
            include: {
                model: bicicletasModels,
                as: 'bike'
            }
        });

        // Map items to Loopback structure
        const mappedData = await Promise.all(data.map(mapCandadoToFrontend));
        res.send(mappedData);
    } catch (error) {
        console.error("Error fetching locks:", error);
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
