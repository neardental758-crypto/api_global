const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { prestamosModels, usuarioModels, bicicletasModels, estacionModels, comentariosModels, empresaModels } = require('../models');
const { Op } = require('sequelize');

const get5gLoansForOrganization = async (organizationId) => {
    // Find organization name to match
    const organization = await empresaModels.findByPk(organizationId);
    const organizationName = organization && organization.emp_nombre ? organization.emp_nombre : null;

    const loans = await prestamosModels.findAll({
        where: {
            pre_modulo: '5g'
        },
        include: [
            {
                model: bicicletasModels,
                as: 'bicicleta',
                attributes: ['bic_id', 'bic_numero', 'bic_nombre', 'bic_estacion']
            },
            {
                model: usuarioModels,
                as: 'usuario',
                attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_genero', 'usu_email', 'usu_telefono', 'usu_prueba'],
                required: true,
                where: {
                    usu_prueba: 0,
                    usu_empresa: organizationName ? [organizationId, organizationName] : [organizationId]
                },
                include: [{
                    model: empresaModels,
                    attributes: ['emp_id', 'emp_nombre'],
                    required: false
                }]
            },
            {
                model: estacionModels,
                attributes: ['est_estacion', 'est_empresa', 'est_direccion'],
                required: false
            },
            {
                model: comentariosModels,
                as: 'comentarios',
                attributes: ['com_calificacion', 'com_comentario'],
                required: false
            }
        ],
        order: [['pre_id', 'DESC']]
    });

    return loans;
};

const safeISOString = (val) => {
    if (!val) return null;
    if (val instanceof Date) {
        return val.toISOString();
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString();
};

const mapLoanToTrip = (loan) => {
    const userObj = loan.usuario || {};
    const bikeObj = loan.bicicleta || {};
    const commentObj = loan.comentarios || {};

    const startStationName = loan.pre_retiro_estacion || "";
    const endStationName = loan.pre_devolucion_estacion || startStationName || "";

    const bikeName = bikeObj.bic_nombre || "";
    const bikeNumber = bikeObj.bic_numero || "";
    const normalizedBikeName = String(bikeName || "").toLowerCase();
    const bikeType = normalizedBikeName.includes("elect") ? "electric" : "mechanic";

    const isFinished = !!loan.pre_devolucion_fecha;
    const state = isFinished ? "finished" : "active";

    return {
        id: loan.pre_id ? String(loan.pre_id) : "",
        state: state,
        startDate: safeISOString(loan.pre_retiro_fecha),
        endDate: safeISOString(loan.pre_devolucion_fecha),
        time: loan.pre_duracion ? Math.round(Number(loan.pre_duracion)) : 0,
        distanceKm: 0,
        user: {
            name: userObj.usu_nombre || "",
            email: userObj.usu_email || userObj.usu_correo || "",
            idNumber: userObj.usu_documento ? String(userObj.usu_documento) : "",
            phoneNumber: userObj.usu_telefono ? String(userObj.usu_telefono) : "",
            prueba: userObj.usu_prueba || 0
        },
        startStation: {
            name: startStationName
        },
        endStation: {
            name: endStationName
        },
        bike: {
            id: loan.pre_bicicleta ? String(loan.pre_bicicleta) : "",
            name: bikeName,
            number: bikeNumber,
            type: bikeType
        },
        feedbacks: {
            rating: commentObj.com_calificacion ? Number(commentObj.com_calificacion) : null,
            comment: commentObj.com_comentario || ""
        }
    };
};

const applyWhereFilter = (trip, cond) => {
    for (const [key, val] of Object.entries(cond)) {
        if (key === 'and' && Array.isArray(val)) {
            if (!val.every(subCond => applyWhereFilter(trip, subCond))) return false;
            continue;
        }
        if (key === 'or' && Array.isArray(val)) {
            if (!val.some(subCond => applyWhereFilter(trip, subCond))) return false;
            continue;
        }
        
        if (key === 'organizationId') {
            continue;
        }
        
        let tripVal;
        if (key === 'state') {
            tripVal = trip.state;
        } else if (key === 'startDate') {
            tripVal = trip.startDate;
        } else if (key === 'endDate') {
            tripVal = trip.endDate;
        } else if (key === 'user.idNumber' || key === 'idNumber') {
            tripVal = trip.user.idNumber;
        } else if (key === 'user.email' || key === 'email') {
            tripVal = trip.user.email;
        } else if (key === 'bike.number' || key === 'number') {
            tripVal = trip.bike.number;
        } else if (key === 'startStation.name') {
            tripVal = trip.startStation.name;
        } else {
            tripVal = trip[key];
        }

        if (val && typeof val === 'object') {
            const op = Object.keys(val)[0];
            const opVal = val[op];
            if (op === 'like') {
                const regex = new RegExp(opVal, 'i');
                if (!regex.test(String(tripVal))) return false;
            } else if (op === 'gte') {
                if (new Date(tripVal) < new Date(opVal)) return false;
            } else if (op === 'lte') {
                if (new Date(tripVal) > new Date(opVal)) return false;
            } else if (op === 'inq') {
                if (!opVal.includes(tripVal)) return false;
            }
        } else {
            if (String(tripVal) !== String(val)) return false;
        }
    }
    return true;
};

const extractOrgId = (obj) => {
    if (!obj) return null;
    if (obj.organizationId) return obj.organizationId;
    
    // Check if there is an 'or' array
    if (Array.isArray(obj.or)) {
        for (const item of obj.or) {
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
    const recurse = (current) => {
        if (!current || found) return;
        if (typeof current === 'string') {
            if (current.includes('-') && current.length >= 20) {
                found = current;
            }
            return;
        }
        if (Array.isArray(current)) {
            for (const el of current) {
                recurse(el);
            }
        } else if (typeof current === 'object') {
            for (const [k, v] of Object.entries(current)) {
                if (k.includes('-') && k.length >= 20) {
                    found = k;
                    return;
                }
                recurse(v);
            }
        }
    };
    recurse(obj);
    return found;
};

router.get('/count', authMiddleware(["all"]), async (req, res) => {
    try {
        let where = {};
        if (req.query.where) {
            where = JSON.parse(req.query.where);
        }

        const organizationId = extractOrgId(where);
        if (!organizationId) {
            return res.status(200).json({ count: 0 });
        }

        const rawLoans = await get5gLoansForOrganization(organizationId);
        let trips = rawLoans.map(mapLoanToTrip);

        if (where) {
            trips = trips.filter(trip => applyWhereFilter(trip, where));
        }

        res.status(200).json({ count: trips.length });
    } catch (error) {
        console.error("Error in GET /api/trips/count:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', authMiddleware(["all"]), async (req, res) => {
    try {
        let filter = {};
        if (req.query.filter) {
            filter = JSON.parse(req.query.filter);
        }

        const where = filter.where || {};
        const organizationId = extractOrgId(filter);
        
        if (!organizationId) {
            return res.status(200).json([]);
        }

        const rawLoans = await get5gLoansForOrganization(organizationId);
        let trips = rawLoans.map(mapLoanToTrip);

        if (where) {
            trips = trips.filter(trip => applyWhereFilter(trip, where));
        }

        const skip = Number(filter.skip) || 0;
        const limit = Number(filter.limit) || trips.length;
        const paginatedTrips = trips.slice(skip, skip + limit);

        res.status(200).json(paginatedTrips);
    } catch (error) {
        console.error("Error in GET /api/trips:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
