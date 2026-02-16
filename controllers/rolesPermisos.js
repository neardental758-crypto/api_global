const { matchedData } = require('express-validator');
const { rolesPermisosModels, rolesModels, permisosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await rolesPermisosModels.findAll({
            include: [
                {
                    model: rolesModels
                },
                {
                    model: permisosModels
                }
            ]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEMS_ROL_PERMISO");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { rp_id } = req;
        const data = await rolesPermisosModels.findByPk(rp_id, {
            include: [
                {
                    model: rolesModels
                },
                {
                    model: permisosModels
                }
            ]
        });
        if (!data) {
            return res.status(404).send({ error: "Rol-Permiso no encontrado" });
        }
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ROL_PERMISO");
    }
};

const getByRol = async (req, res) => {
    try {
        req = matchedData(req);
        const { rp_rol_id } = req;
        const data = await rolesPermisosModels.findAll({
            where: { rp_rol_id },
            include: [
                {
                    model: rolesModels
                },
                {
                    model: permisosModels
                }
            ]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_PERMISOS_BY_ROL");
    }
};

const createItem = async (req, res) => {
    try {
        const body = matchedData(req);
        const data = await rolesPermisosModels.create(body);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_CREATE_ROL_PERMISO");
    }
};

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { rp_id } = req;
        
        const rolPermiso = await rolesPermisosModels.findByPk(rp_id);
        if (!rolPermiso) {
            return res.status(404).send({ error: "Rol-Permiso no encontrado" });
        }
        
        await rolesPermisosModels.destroy({
            where: { rp_id }
        });
        
        res.send({ message: "Rol-Permiso eliminado exitosamente" });
    } catch (error) {
        httpError(res, "ERROR_DELETE_ROL_PERMISO");
    }
};

module.exports = {
    getItems,
    getItem,
    getByRol,
    createItem,
    deleteItem
};