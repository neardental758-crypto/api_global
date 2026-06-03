const express = require('express');
const router = express.Router();
const { bicicletasModels, estacionModels, empresaModels, candadosModels, bicicleterosModels } = require('../models');
const authMiddleware = require('../middleware/session');
const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');

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

function mapEstadoToFrontend(estado) {
    const map = {
        'DISPONIBLE': 'active',
        'INACTIVA': 'inactive',
        'EN TALLER': 'workshop',
        'PRESTADA': 'trip',
        'PRESTAMO PERSONALIZADO': 'trip',
        'PRESTAMO DE EMERGENCIA': 'trip emergency',
        'RESERVADA': 'trip'
    };
    return map[estado] || estado || 'inactive';
}

function mapEstadoToDb(estado) {
    const map = {
        'active': 'DISPONIBLE',
        'inactive': 'INACTIVA',
        'workshop': 'EN TALLER',
        'trip': 'PRESTADA',
        'trip emergency': 'PRESTAMO DE EMERGENCIA'
    };
    return map[estado] || estado || 'INACTIVA';
}

// Map database Sequelize Bicicleta model to Loopback JSON expected by frontend
function mapBicicletaToFrontend(bike) {
    const json = bike.toJSON ? bike.toJSON() : bike;
    const bluetooth = json.bic_bluetooth || (json.bc_bicicletero ? json.bc_bicicletero.bro_bluetooth : "");
    const clave = json.bic_clave || (json.bc_bicicletero ? json.bc_bicicletero.bro_clave : "");

    return {
        id: json.bic_id,
        nombre: json.bic_nombre || "",
        type: json.bic_nombre || "", // Map to type for frontend compatibility
        number: json.bic_numero || "",
        estacion: json.bic_estacion || "",
        estado: mapEstadoToFrontend(json.bic_estado),
        descripcion: json.bic_descripcion || "",
        bluetooth: bluetooth,
        clave: clave,
        createdAt: json.bic_created_at || null,
        updatedAt: json.bic_updated_at || null,
        station: {
            id: json.bic_estacion || "",
            name: json.bic_estacion || ""
        },
        lock: json.lock ? {
            id: json.lock.can_id,
            imei: json.lock.can_imei || "",
            qrNumber: json.lock.can_qr || "",
            mac: json.lock.can_mac || "",
            lockStatus: json.lock.can_estado_candado || "",
            battery: json.lock.can_bateria || 0
        } : {}
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
            order: [['bic_id', 'DESC']],
            include: [
                { model: candadosModels, as: 'lock' },
                { model: bicicleterosModels }
            ]
        });

        const mappedData = data.map(mapBicicletaToFrontend);
        res.send(mappedData);
    } catch (error) {
        console.error("Error fetching bikes compatibility layer:", error);
        res.status(500).send({ error: error.message });
    }
});

// POST /api/bikes
router.post("/", authMiddleware(['all']), async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const body = req.body;

        // Find company by organizationId
        const company = await empresaModels.findOne({ where: { emp_id: body.organizationId } });

        let bic_clave = null;
        let bic_bluetooth = null;
        let bro_clave = "";
        let bro_bluetooth = "";

        if (company) {
            const is5G = company._5G && company._5G !== 'NULL';
            const is4G = company._4G && company._4G !== 'NULL';
            const is3G = company._3G && company._3G !== 'NULL';

            if (is5G) {
                bic_clave = null;
                bic_bluetooth = null;
                bro_clave = "";
                bro_bluetooth = "";
            } else if (is4G) {
                bic_bluetooth = body.bluetooth || "123";
                bic_clave = null;
                bro_bluetooth = body.bluetooth || "123";
                bro_clave = "";
            } else if (is3G) {
                bic_clave = body.clave || "0000";
                bic_bluetooth = null;
                bro_clave = body.clave || "0000";
                bro_bluetooth = "";
            } else {
                bic_clave = body.clave || null;
                bic_bluetooth = body.bluetooth || null;
                bro_clave = body.clave || "0000";
                bro_bluetooth = body.bluetooth || "123";
            }
        } else {
            bic_clave = body.clave || null;
            bic_bluetooth = body.bluetooth || null;
            bro_clave = body.clave || "0000";
            bro_bluetooth = body.bluetooth || "123";
        }

        const dbEstado = mapEstadoToDb(body.state);

        const bicicleta = await bicicletasModels.create({
            bic_nombre: body.type || "",
            bic_numero: String(body.number || ""),
            bic_estacion: body.stationId || "",
            bic_estado: dbEstado,
            bic_descripcion: body.type || "",
            bic_bluetooth: bic_bluetooth,
            bic_clave: bic_clave,
            bic_created_at: new Date(),
            bic_updated_at: new Date()
        }, { transaction: t });

        const realId = bicicleta.bic_id;

        if (realId && realId !== 0) {
            await bicicleterosModels.create({
                bro_nombre: "bicicletero" + realId,
                bro_estacion: body.stationId || "",
                bro_numero: String(realId),
                bro_bicicleta: Number(realId),
                bro_bluetooth: bro_bluetooth,
                bro_clave: bro_clave,
            }, { transaction: t });
        }

        await t.commit();

        res.status(201).send(mapBicicletaToFrontend(bicicleta));
    } catch (error) {
        await t.rollback();
        console.error("Error creating bike in compatibility layer:", error);
        res.status(500).send({ error: error.message });
    }
});

// PATCH /api/bikes/:id
router.patch("/:id", authMiddleware(['all']), async (req, res) => {
    try {
        const bic_id = req.params.id;
        const body = req.body;

        const updateData = {};
        if (body.number !== undefined) updateData.bic_numero = String(body.number);
        if (body.type !== undefined) {
            updateData.bic_nombre = body.type;
            updateData.bic_descripcion = body.type;
        }
        if (body.stationId !== undefined) updateData.bic_estacion = body.stationId;
        if (body.state !== undefined) updateData.bic_estado = mapEstadoToDb(body.state);

        // Also update bicicletero if station changed
        if (body.stationId !== undefined) {
            const bicicleteroActual = await bicicleterosModels.findOne({
                where: { bro_bicicleta: bic_id }
            });
            if (bicicleteroActual) {
                await bicicleterosModels.update({
                    bro_estacion: body.stationId
                }, {
                    where: { bro_id: bicicleteroActual.bro_id }
                });
            }
        }

        updateData.bic_updated_at = new Date();

        await bicicletasModels.update(updateData, {
            where: { bic_id: bic_id }
        });

        res.status(200).send({
            id: bic_id,
            ...body
        });
    } catch (error) {
        console.error("Error updating bike in compatibility layer:", error);
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
