const { matchedData } = require('express-validator');
const { usuariosRolesModels, usuarioModels, rolesModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await usuariosRolesModels.findAll({
            include: [
                {
                    model: usuarioModels
                },
                {
                    model: rolesModels
                }
            ]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEMS_USUARIO_ROL");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { ur_id } = req;
        const data = await usuariosRolesModels.findByPk(ur_id, {
            include: [
                {
                    model: usuarioModels
                },
                {
                    model: rolesModels
                }
            ]
        });
        if (!data) {
            return res.status(404).send({ error: "Usuario-Rol no encontrado" });
        }
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_USUARIO_ROL");
    }
};

const getByUsuario = async (req, res) => {
    try {
        req = matchedData(req);
        const { ur_usuario_id } = req;
        const data = await usuariosRolesModels.findAll({
            where: { ur_usuario_id },
            include: [
                {
                    model: usuarioModels
                },
                {
                    model: rolesModels
                }
            ]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ROLES_BY_USUARIO");
    }
};

const createItem = async (req, res) => {
    try {
        const body = matchedData(req);
        const data = await usuariosRolesModels.create(body);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_CREATE_USUARIO_ROL");
    }
};

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { ur_id } = req;
        
        const usuarioRol = await usuariosRolesModels.findByPk(ur_id);
        if (!usuarioRol) {
            return res.status(404).send({ error: "Usuario-Rol no encontrado" });
        }
        
        await usuariosRolesModels.destroy({
            where: { ur_id }
        });
        
        res.send({ message: "Usuario-Rol eliminado exitosamente" });
    } catch (error) {
        httpError(res, "ERROR_DELETE_USUARIO_ROL");
    }
};

module.exports = {
    getItems,
    getItem,
    getByUsuario,
    createItem,
    deleteItem
};