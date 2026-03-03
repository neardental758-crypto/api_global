const { matchedData } = require('express-validator');
const { tarjetasNfcModels, usuarioModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const parseJsonQuery = (value) => {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch (e) {
        return null;
    }
};

const orderFieldMap = {
    id: 'tnfc_id',
    cardNumber: 'tnfc_numero_tarjeta',
    hexadecimalId: 'tnfc_id_hexadecimal',
    state: 'tnfc_estado',
    userId: 'tnfc_usuario_id',
    createdAt: 'tnfc_created_at',
    updatedAt: 'tnfc_updated_at',
};

const convertWhereOperators = (where) => {
    if (!where || typeof where !== 'object') return where;

    if (Array.isArray(where)) {
        return where.map(convertWhereOperators);
    }

    // Group operators
    if (where.and && Array.isArray(where.and)) {
        return { [Op.and]: where.and.map(convertWhereOperators) };
    }
    if (where.or && Array.isArray(where.or)) {
        return { [Op.or]: where.or.map(convertWhereOperators) };
    }

    const out = {};
    Object.keys(where).forEach((key) => {
        const value = where[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            if (Object.prototype.hasOwnProperty.call(value, 'eq')) {
                out[key] = value.eq;
                return;
            }
            if (Object.prototype.hasOwnProperty.call(value, 'inq')) {
                out[key] = { [Op.in]: value.inq };
                return;
            }
            if (Object.prototype.hasOwnProperty.call(value, 'like')) {
                out[key] = { [Op.like]: value.like };
                return;
            }
        }
        out[key] = value;
    });

    return out;
};

const buildFindOptionsFromFilter = (filter) => {
    const opts = {};

    if (filter && typeof filter === 'object') {
        if (filter.where) opts.where = convertWhereOperators(filter.where);
        if (Number.isFinite(filter.limit)) opts.limit = filter.limit;
        if (Number.isFinite(filter.skip)) opts.offset = filter.skip;

        if (filter.order) {
            // LoopBack suele enviar order: ["createdAt DESC"] o "createdAt DESC"
            const order = Array.isArray(filter.order) ? filter.order : [filter.order];
            opts.order = order
                .map((entry) => {
                    if (typeof entry !== 'string') return null;
                    const [field, dir] = entry.trim().split(/\s+/);
                    if (!field) return null;
                    const mappedField = orderFieldMap[field] || field;
                    return [mappedField, (dir || 'ASC').toUpperCase()];
                })
                .filter(Boolean);
        }
    }

    // Siempre incluimos usuario (asociación alias 'user')
    opts.include = [
        {
            model: usuarioModels,
            as: 'user',
            required: false,
        },
    ];

    return opts;
};

const getItems = async (req, res) => {
    try {
        const filter = parseJsonQuery(req.query && req.query.filter);
        const findOptions = buildFindOptionsFromFilter(filter);
        const data = await tarjetasNfcModels.findAll(findOptions);
        // Para compatibilidad con LoopBack frontend que espera un array
        res.send(data);
    } catch (error) {
        console.error(error);
        httpError(res, "ERROR_GET_ITEMS_TARJETA_NFC");
    }
};

const countItems = async (req, res) => {
    try {
        const whereRaw = parseJsonQuery(req.query && req.query.where) || {};
        const where = convertWhereOperators(whereRaw);
        const count = await tarjetasNfcModels.count({ where });
        res.send({ count });
    } catch (error) {
        httpError(res, 'ERROR_COUNT_TARJETA_NFC');
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { tnfc_id } = req;
        const data = await tarjetasNfcModels.findByPk(tnfc_id, {
            include: [{
                model: usuarioModels,
                as: 'user',
                required: false,
            }]
        });
        if (!data) {
            return res.status(404).send({ error: "Tarjeta NFC no encontrada" });
        }
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_TARJETA_NFC");
    }
};

const getByHexadecimal = async (req, res) => {
    try {
        req = matchedData(req);
        const { tnfc_id_hexadecimal } = req;
        const data = await tarjetasNfcModels.findOne({
            where: { tnfc_id_hexadecimal },
            include: [{
                model: usuarioModels,
                as: 'user',
                required: false,
            }]
        });
        if (!data) {
            return res.status(404).send({ error: "Tarjeta NFC no encontrada" });
        }
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_TARJETA_BY_HEXADECIMAL");
    }
};

const getByUsuario = async (req, res) => {
    try {
        req = matchedData(req);
        const { tnfc_usuario_id } = req;
        const data = await tarjetasNfcModels.findAll({
            where: { tnfc_usuario_id },
            include: [{
                model: usuarioModels,
                as: 'user',
                required: false,
            }]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_TARJETAS_BY_USUARIO");
    }
};

const createItem = async (req, res) => {
    try {
        const body = matchedData(req);
        const now = new Date();

        // Si no viene tnfc_id, generarlo (evita bloquear el frontend)
        if (!body.tnfc_id) {
            body.tnfc_id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
        }
        if (!body.tnfc_created_at) body.tnfc_created_at = now;
        if (!body.tnfc_updated_at) body.tnfc_updated_at = now;

        const data = await tarjetasNfcModels.create(body);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_CREATE_TARJETA_NFC");
    }
};

const createTestItem = async (req, res) => {
    try {
        const now = new Date();
        const data = await tarjetasNfcModels.create({
            tnfc_id: `test_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            tnfc_numero_tarjeta: Math.floor(Date.now() / 1000) % 1000000,
            tnfc_id_hexadecimal: `TEST_${Math.random().toString(16).slice(2)}`,
            tnfc_estado: 'Active',
            tnfc_usuario_id: null,
            tnfc_created_at: now,
            tnfc_updated_at: now,
        });
        res.send({ data });
    } catch (error) {
        httpError(res, 'ERROR_CREATE_TEST_TARJETA_NFC');
    }
};

const updateItem = async (req, res) => {
    try {
        const { tnfc_id } = matchedData(req);
        const body = { ...req.body };

        const tarjeta = await tarjetasNfcModels.findByPk(tnfc_id);
        if (!tarjeta) {
            return res.status(404).send({ error: "Tarjeta NFC no encontrada" });
        }

        body.tnfc_updated_at = new Date();

        await tarjetasNfcModels.update(body, {
            where: { tnfc_id }
        });

        const data = await tarjetasNfcModels.findByPk(tnfc_id);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_UPDATE_TARJETA_NFC");
    }
};

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { tnfc_id } = req;

        const tarjeta = await tarjetasNfcModels.findByPk(tnfc_id);
        if (!tarjeta) {
            return res.status(404).send({ error: "Tarjeta NFC no encontrada" });
        }

        await tarjetasNfcModels.destroy({
            where: { tnfc_id }
        });

        res.send({ message: "Tarjeta NFC eliminada exitosamente" });
    } catch (error) {
        httpError(res, "ERROR_DELETE_TARJETA_NFC");
    }
};

module.exports = {
    getItems,
    countItems,
    getItem,
    getByHexadecimal,
    getByUsuario,
    createItem,
    createTestItem,
    updateItem,
    deleteItem
};