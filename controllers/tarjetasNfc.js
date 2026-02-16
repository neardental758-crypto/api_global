const { matchedData } = require('express-validator');
const { tarjetasNfcModels, usuarioModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await tarjetasNfcModels.findAll({
            include: [{
                model: usuarioModels
            }]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEMS_TARJETA_NFC");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { tnfc_id } = req;
        const data = await tarjetasNfcModels.findByPk(tnfc_id, {
            include: [{
                model: usuarioModels
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
                model: usuarioModels
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
                model: usuarioModels
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
        const data = await tarjetasNfcModels.create(body);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_CREATE_TARJETA_NFC");
    }
};

const updateItem = async (req, res) => {
    try {
        const { tnfc_id } = matchedData(req);
        const body = req.body;
        
        const tarjeta = await tarjetasNfcModels.findByPk(tnfc_id);
        if (!tarjeta) {
            return res.status(404).send({ error: "Tarjeta NFC no encontrada" });
        }
        
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
    getItem,
    getByHexadecimal,
    getByUsuario,
    createItem,
    updateItem,
    deleteItem
};