const { matchedData } = require('express-validator');
const { candadosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await candadosModels.findAll();
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEMS_CANDADO");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { can_id } = req;
        const data = await candadosModels.findByPk(can_id);
        if (!data) {
            return res.status(404).send({ error: "Candado no encontrado" });
        }
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_CANDADO");
    }
};

const getItemByImei = async (req, res) => {
    try {
        req = matchedData(req);
        const { can_imei } = req;
        const data = await candadosModels.findOne({
            where: { can_imei }
        });
        if (!data) {
            return res.status(404).send({ error: "Candado no encontrado" });
        }
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_CANDADO_BY_IMEI");
    }
};

const createItem = async (req, res) => {
    try {
        const body = matchedData(req);
        const data = await candadosModels.create(body);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_CREATE_CANDADO");
    }
};

const updateItem = async (req, res) => {
    try {
        const { can_id } = matchedData(req);
        const body = req.body;
        
        const candado = await candadosModels.findByPk(can_id);
        if (!candado) {
            return res.status(404).send({ error: "Candado no encontrado" });
        }
        
        await candadosModels.update(body, {
            where: { can_id }
        });
        
        const data = await candadosModels.findByPk(can_id);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_UPDATE_CANDADO");
    }
};

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { can_id } = req;
        
        const candado = await candadosModels.findByPk(can_id);
        if (!candado) {
            return res.status(404).send({ error: "Candado no encontrado" });
        }
        
        await candadosModels.destroy({
            where: { can_id }
        });
        
        res.send({ message: "Candado eliminado exitosamente" });
    } catch (error) {
        httpError(res, "ERROR_DELETE_CANDADO");
    }
};

module.exports = {
    getItems,
    getItem,
    getItemByImei,
    createItem,
    updateItem,
    deleteItem
};