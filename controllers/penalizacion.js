const { matchedData } = require('express-validator');
const { penalizacionModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        let where = {};
        if (req.query.filter) {
            try {
                const parsedFilter = JSON.parse(req.query.filter);
                if (parsedFilter.where) {
                    let userId = null;
                    if (parsedFilter.where.and) {
                        const userIdCondition = parsedFilter.where.and.find(cond => cond.userId !== undefined);
                        if (userIdCondition) {
                            userId = userIdCondition.userId;
                        }
                    } else if (parsedFilter.where.userId) {
                        userId = parsedFilter.where.userId;
                    }
                    
                    if (userId) {
                        where = {
                            pen_usuario: userId,
                            pen_estado: 'ACTIVA'
                        };
                    }
                }
            } catch (parseError) {
                console.error("Error parsing filter:", parseError);
            }
        }
        const data = await penalizacionModels.findAll({ where });
        res.send({ data });
    } catch (error) {
        console.error("Error in getItems penalizacion:", error);
        httpError(res, "ERROR_GET_ITEM_PENALIZACION");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {pen_id} = req
        const data = await penalizacionModels.findByPk(pen_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PENALIZACION")
    }
};

const getItemUser = async (req, res) => {
    try {
        req = matchedData(req)
        const { pen_usuario } = req
        const data = await penalizacionModels.findAll({ where: { pen_usuario: pen_usuario, pen_estado: 'ACTIVA'}});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PENALIZACIONES_USUARIO")
    }
};

const createItem = async (req, res) => {
    try {
        let body = req.body;
        
        // Si el body viene con formato frontend (loopback/mongo)
        if (body.reason || body.userId || body.tipo_penalizacion_id) {
            body = {
                pen_tipo_penalizacion: body.tipo_penalizacion_id || body.tpp_id,
                pen_novedad: body.reason,
                pen_usuario: body.userId,
                pen_fecha_creacion: body.startDate || new Date().toISOString(),
                pen_fecha_tiempo_ok: body.endDate || new Date().toISOString(),
                pen_fecha_dinero_ok: body.pen_fecha_dinero_ok || "Sin fecha",
                pen_estado: body.pen_estado || "ACTIVA",
                pen_fecha_apelado: body.pen_fecha_apelado || "Sin fecha",
                pen_motivo_apelado: body.pen_motivo_apelado || "Sin motivo"
            };
        }
        
        const data = await penalizacionModels.create(body);
        res.send({ status: 'ok' });
    } catch (e) {
        console.error("Error creating penalty:", e);
        httpError(res, "ERROR_CREATE_PENALIZACIONES");
    }
};

const updateItem = async (req, res) => {
    try {
        let pen_id = req.params.pen_id || req.body.id;
        if (!pen_id) {
            return res.status(400).send({ error: "Missing penalty ID" });
        }
        
        // Find the penalty
        const penalty = await penalizacionModels.findByPk(pen_id);
        if (!penalty) {
            return res.status(404).send({ error: "Penalty not found" });
        }
        
        // Update its state to 'INACTIVA' and set the endDate
        const endDateStr = req.body.endDate || new Date().toISOString();
        
        await penalty.update({
            pen_estado: 'INACTIVA',
            pen_fecha_tiempo_ok: endDateStr
        });
        
        res.send({ status: 'ok' });
    } catch (error) {
        console.error("Error in updateItem penalizacion:", error);
        httpError(res, "ERROR_UPDATE_PENALIZACION");
    }
};

const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, getItemUser, createItem, updateItem, deleteItem
};
