const { matchedData } = require('express-validator');
const { vpcomentariosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require("sequelize");

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await vpcomentariosModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_VIAJES_VP");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {via_usuario} = req
        const data = await vpviajesModels.findAll({ where: { via_usuario: via_usuario }});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMENTARIO_VP");
    }
};

const getItemUsuario = async (req, res) => {
    try {
        req = matchedData(req)
        const { via_usuario } = req
        const data = await vpcomentariosModels.findAll({ where: { via_usuario: via_usuario, via_estado: 'ACTIVA' }});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMENTARIO_USUARIO_VP")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        console.log('el body: ', body)
        const data = await vpcomentariosModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_COMENTARIO_VP")
    }

};


const updateId = async (req, res) => {
    try {
        const { body } = req
        const data = await vpcomentariosModels.update(
            {
                via_fecha_creacion: body.via_fecha_creacion,
                via_duracion: body.via_duracion,
                via_kilometros: body.via_kilometros,
                via_estado : body.via_estado
            },
            {
                where: { via_id : body.via_id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_COMENTARIO_VP");
    }
};

const deleteItem = (req, res) => {};

module.exports = {
    getItems,
    getItem,
    getItemUsuario,
    createItem,
    updateId,
    deleteItem,
}
