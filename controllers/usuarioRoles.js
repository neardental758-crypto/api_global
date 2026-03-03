const { matchedData } = require('express-validator');
const { usuariosRolesModels, usuarioModels, rolesModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await usuariosRolesModels.findAll({
            include: [
                {
                    model: usuarioModels,
                    attributes: [
                        'usu_documento',
                        'usu_nombre',
                        'usu_empresa',
                        'usu_ciudad',
                        'usu_rol_dash',
                        'usu_email',
                        'usu_fecha_nacimiento',
                        'usu_genero',
                        'usu_dir_trabajo',
                        'usu_img',
                        'usu_prueba',
                        'usu_habilitado'
                    ]
                },
                {
                    model: rolesModels,
                    attributes: [
                        'rol_id',
                        'rol_nombre',
                        'rol_descripcion'
                    ]
                }
            ]
        });
        res.send({ data });
    } catch (error) {
        console.error(error);
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
                    model: usuarioModels,
                    attributes: [
                        'usu_documento',
                        'usu_nombre',
                        'usu_empresa',
                        'usu_ciudad',
                        'usu_rol_dash',
                        'usu_email',
                        'usu_fecha_nacimiento',
                        'usu_genero',
                        'usu_dir_trabajo',
                        'usu_img',
                        'usu_prueba',
                        'usu_habilitado'
                    ]
                },
                {
                    model: rolesModels,
                    attributes: [
                        'rol_id',
                        'rol_nombre',
                        'rol_descripcion'
                    ]
                }
            ]
        });
        if (!data) {
            return res.status(404).send({ error: "Usuario-Rol no encontrado" });
        }
        res.send({ data });
    } catch (error) {
        console.error(error);
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
                    model: usuarioModels,
                    attributes: [
                        'usu_documento',
                        'usu_nombre',
                        'usu_empresa',
                        'usu_ciudad',
                        'usu_rol_dash',
                        'usu_email',
                        'usu_fecha_nacimiento',
                        'usu_genero',
                        'usu_dir_trabajo',
                        'usu_img',
                        'usu_prueba',
                        'usu_habilitado'
                    ]
                },
                {
                    model: rolesModels,
                    attributes: [
                        'rol_id',
                        'rol_nombre',
                        'rol_descripcion'
                    ]
                }
            ]
        });
        res.send({ data });
    } catch (error) {
        console.error(error);
        httpError(res, "ERROR_GET_ROLES_BY_USUARIO");
    }
};

const createItem = async (req, res) => {
    try {
        const body = matchedData(req);
        const data = await usuariosRolesModels.create(body);
        res.send({ data });
    } catch (error) {
        console.error(error);
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
        console.error(error);
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