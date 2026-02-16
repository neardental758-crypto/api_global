const { matchedData } = require('express-validator');
const { rolesModels, rolesPermisosModels, permisosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await rolesModels.findAll({
            include: [{
                model: rolesPermisosModels,
                include: [{
                    model: permisosModels
                }]
            }]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEMS_ROL");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { rol_id } = req;
        const data = await rolesModels.findByPk(rol_id, {
            include: [{
                model: rolesPermisosModels,
                include: [{
                    model: permisosModels
                }]
            }]
        });
        if (!data) {
            return res.status(404).send({ error: "Rol no encontrado" });
        }
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ROL");
    }
};

const createItem = async (req, res) => {
    try {
        const body = matchedData(req);
        const data = await rolesModels.create(body);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_CREATE_ROL");
    }
};

const updateItem = async (req, res) => {
    try {
        const { rol_id } = matchedData(req);
        const body = req.body;
        
        const rol = await rolesModels.findByPk(rol_id);
        if (!rol) {
            return res.status(404).send({ error: "Rol no encontrado" });
        }
        
        await rolesModels.update(body, {
            where: { rol_id }
        });
        
        const data = await rolesModels.findByPk(rol_id);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ROL");
    }
};

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { rol_id } = req;
        
        const rol = await rolesModels.findByPk(rol_id);
        if (!rol) {
            return res.status(404).send({ error: "Rol no encontrado" });
        }
        
        await rolesModels.destroy({
            where: { rol_id }
        });
        
        res.send({ message: "Rol eliminado exitosamente" });
    } catch (error) {
        httpError(res, "ERROR_DELETE_ROL");
    }
};

module.exports = {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
};