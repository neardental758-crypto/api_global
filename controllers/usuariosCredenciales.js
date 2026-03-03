const { matchedData } = require('express-validator');
const { usuariosCredencialesModels, usuarioModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { encrypt, compare } = require('../utils/handlePassword');
const { tokenSign_2 } = require('../utils/handleJwt');
const { sequelize } = require('../config/mysql');
const { QueryTypes } = require('sequelize');

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
        const hasPassword = body && typeof body.uc_password !== "undefined" && body.uc_password !== null;
        if (hasPassword) {
            body.uc_password = await encrypt(String(body.uc_password));
        }

        if (!credencial) {
            if (!hasPassword) {
                return res.status(400).send({ error: "DATOS_INCOMPLETOS" });
            }

            const now = new Date();
            await usuariosCredencialesModels.create(
                {
                    uc_id: "uc-" + String(uc_usuario_id),
                    uc_usuario_id: String(uc_usuario_id),
                    uc_password: body.uc_password,
                    uc_created_at: now,
                    uc_updated_at: now,
                },
            );
        } else {
            if (!hasPassword) {
                return res.status(400).send({ error: "DATOS_INCOMPLETOS" });
            }

            await usuariosCredencialesModels.update(
                {
                    uc_password: body.uc_password,
                    uc_updated_at: new Date(),
                },
                {
                    where: { uc_usuario_id },
                },
            );
        }
        
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

const login = async (req, res) => {
    try {
        const { user, password } = req.body || {};

        if (!user || !password) {
            res.status(400).send({ error: "DATOS_INCOMPLETOS" });
            return;
        }

        let userId = user;

        if (typeof user === "string" && user.includes("@")) {
            const usuarioRows = await sequelize.query(
                "SELECT usu_documento FROM bc_usuarios WHERE usu_email = ? LIMIT 1",
                {
                    replacements: [user],
                    type: QueryTypes.SELECT,
                }
            );

            if (!usuarioRows || !usuarioRows[0] || !usuarioRows[0].usu_documento) {
                res.status(404).send({ error: "USER_NOT_EXISTS" });
                return;
            }

            userId = usuarioRows[0].usu_documento;
        }

        const credencial = await usuariosCredencialesModels.findOne({
            where: { uc_usuario_id: userId }
        });

        if (!credencial) {
            res.status(404).send({ error: "USER_NOT_EXISTS" });
            return;
        }

        const hashPassword = credencial.get('uc_password');
        const ok = await compare(password, hashPassword);

        if (!ok) {
            res.status(401).send({ error: "PASSWORD_INVALID" });
            return;
        }

        const token = await tokenSign_2({
            role: "admin",
            permissions: ["all"],
            userId: userId,
        });

        res.send({ token, id_user: userId });
    } catch (error) {
        console.error("ERROR_LOGIN_USUARIO_CREDENCIAL:", error);
        httpError(res, "ERROR_LOGIN_USUARIO_CREDENCIAL", 500);
    }
};

module.exports = {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    login
};