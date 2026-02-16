const { matchedData } = require('express-validator');
const { usuariosPermisosModels, usuarioModels, permisosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await usuariosPermisosModels.findAll({
            include: [
                {
                    model: usuarioModels
                },
                {
                    model: permisosModels
                }
            ]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEMS_USUARIO_PERMISO");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { up_id } = req;
        const data = await usuariosPermisosModels.findByPk(up_id, {
            include: [
                {
                    model: usuarioModels
                },
                {
                    model: permisosModels
                }
            ]
        });
        if (!data) {
            return res.status(404).send({ error: "Usuario-Permiso no encontrado" });
        }
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_USUARIO_PERMISO");
    }
};

const getByUsuario = async (req, res) => {
    try {
        req = matchedData(req);
        const { up_usuario_id } = req;
        const data = await usuariosPermisosModels.findAll({
            where: { up_usuario_id },
            include: [
                {
                    model: usuarioModels
                },
                {
                    model: permisosModels
                }
            ]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_PERMISOS_BY_USUARIO");
    }
};

const createItem = async (req, res) => {
    try {
        const body = matchedData(req);
        const data = await usuariosPermisosModels.create(body);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_CREATE_USUARIO_PERMISO");
    }
};

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { up_id } = req;
        
        const usuarioPermiso = await usuariosPermisosModels.findByPk(up_id);
        if (!usuarioPermiso) {
            return res.status(404).send({ error: "Usuario-Permiso no encontrado" });
        }
        
        await usuariosPermisosModels.destroy({
            where: { up_id }
        });
        
        res.send({ message: "Usuario-Permiso eliminado exitosamente" });
    } catch (error) {
        httpError(res, "ERROR_DELETE_USUARIO_PERMISO");
    }
};

module.exports = {
    getItems,
    getItem,
    getByUsuario,
    createItem,
    deleteItem
};