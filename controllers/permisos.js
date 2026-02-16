const { matchedData } = require('express-validator');
const { permisosModels, rolesPermisosModels, usuariosPermisosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await permisosModels.findAll();
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEMS_PERMISO");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { per_id } = req;
        const data = await permisosModels.findByPk(per_id);
        if (!data) {
            return res.status(404).send({ error: "Permiso no encontrado" });
        }
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_PERMISO");
    }
};

const getByTipo = async (req, res) => {
    try {
        const { per_tipo } = req.params;
        const data = await permisosModels.findAll({
            where: { per_tipo }
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_PERMISOS_BY_TIPO");
    }
};

const createItem = async (req, res) => {
    try {
        const body = matchedData(req);
        const data = await permisosModels.create(body);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_CREATE_PERMISO");
    }
};

const updateItem = async (req, res) => {
    try {
        const { per_id } = matchedData(req);
        const body = req.body;
        
        const permiso = await permisosModels.findByPk(per_id);
        if (!permiso) {
            return res.status(404).send({ error: "Permiso no encontrado" });
        }
        
        await permisosModels.update(body, {
            where: { per_id }
        });
        
        const data = await permisosModels.findByPk(per_id);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_UPDATE_PERMISO");
    }
};

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { per_id } = req;
        
        const permiso = await permisosModels.findByPk(per_id);
        if (!permiso) {
            return res.status(404).send({ error: "Permiso no encontrado" });
        }
        
        await permisosModels.destroy({
            where: { per_id }
        });
        
        res.send({ message: "Permiso eliminado exitosamente" });
    } catch (error) {
        httpError(res, "ERROR_DELETE_PERMISO");
    }
};

module.exports = {
    getItems,
    getItem,
    getByTipo,
    createItem,
    updateItem,
    deleteItem
};