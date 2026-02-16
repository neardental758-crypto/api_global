const { matchedData } = require('express-validator');
const { usuariosCredencialesModels, usuarioModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { encrypt, compare } = require('../utils/handlePassword');

const getItems = async (req, res) => {
    try {
        const data = await usuariosCredencialesModels.findAll({
            attributes: { exclude: ['uc_password'] },
            include: [{
                model: usuarioModels
            }]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEMS_USUARIO_CREDENCIAL");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { uc_usuario_id } = req;
        const data = await usuariosCredencialesModels.findOne({
            where: { uc_usuario_id },
            attributes: { exclude: ['uc_password'] },
            include: [{
                model: usuarioModels
            }]
        });
        if (!data) {
            return res.status(404).send({ error: "Credencial no encontrada" });
        }
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_USUARIO_CREDENCIAL");
    }
};

const createItem = async (req, res) => {
    try {
        const body = matchedData(req);
        const passwordHash = await encrypt(body.uc_password);
        body.uc_password = passwordHash;
        
        const data = await usuariosCredencialesModels.create(body);
        const { uc_password, ...dataWithoutPassword } = data.toJSON();
        res.send({ data: dataWithoutPassword });
    } catch (error) {
        httpError(res, "ERROR_CREATE_USUARIO_CREDENCIAL");
    }
};

const updateItem = async (req, res) => {
    try {
        const { uc_usuario_id } = matchedData(req);
        const body = req.body;
        
        const credencial = await usuariosCredencialesModels.findOne({
            where: { uc_usuario_id }
        });
        if (!credencial) {
            return res.status(404).send({ error: "Credencial no encontrada" });
        }
        
        if (body.uc_password) {
            body.uc_password = await encrypt(body.uc_password);
        }
        
        await usuariosCredencialesModels.update(body, {
            where: { uc_usuario_id }
        });
        
        const data = await usuariosCredencialesModels.findOne({
            where: { uc_usuario_id },
            attributes: { exclude: ['uc_password'] }
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_UPDATE_USUARIO_CREDENCIAL");
    }
};

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { uc_usuario_id } = req;
        
        const credencial = await usuariosCredencialesModels.findOne({
            where: { uc_usuario_id }
        });
        if (!credencial) {
            return res.status(404).send({ error: "Credencial no encontrada" });
        }
        
        await usuariosCredencialesModels.destroy({
            where: { uc_usuario_id }
        });
        
        res.send({ message: "Credencial eliminada exitosamente" });
    } catch (error) {
        httpError(res, "ERROR_DELETE_USUARIO_CREDENCIAL");
    }
};

module.exports = {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
};