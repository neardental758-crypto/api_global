const { matchedData } = require('express-validator');
const { progresoDesafiosModels, usuarioModels, productosModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');
const progresoDesafios = require('../models/mysql/progresoDesafios');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await progresoDesafiosModels.findAll({});
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_PRODUCTOS");
    }
};

const getItemsToDate = async (req, res) => {
    try {
        const filtro = JSON.parse(req.query.filter);
        const startedDate = new Date(filtro.startDate);
        const endDate = new Date(filtro.endDate);
        const data = await progresoLogrosModels.findAll({
            where: { "ultima_actualizacion": { [Op.between]: [startedDate, endDate] } },
        });
        res.send({ data });
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM `);
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await progresoDesafiosModels.findByPk(id);
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_DESAFIO")
    }
};
const getItemUsuario = async (req, res) => {
    try {
        req = matchedData(req)
        const { usuario_id } = req
        const data = await progresoDesafiosModels.findAll({ where: { usuario_id: usuario_id }});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PROGRESO_LOGROS")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await progresoDesafiosModels.create(body)
        console.log("Request Body:", req.body);
        res.send('ok')
    } catch (error) {
        console.error('Error creating progreso desafio:', error); // Agrega más detalles al log
        httpError(res, "ERROR_CREATE_PROGRESO_DESAFIO");
    }

};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await progresoDesafiosModels.update(
            {
                progreso: body.progreso,
            },
            {
                where: { usuario_id : body.usuario_id , desafio_id : body.desafio_id , id: body.id},
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_PROGRESO_LOGRO");
    }
};
const updateItemState = async (req, res) => {
    try {
        const { body } = req
        const data = await progresoDesafiosModels.update(
            {
                estado: body.estado,
            },
            {
                where: { usuario_id : body.usuario_id , desafio_id : body.desafio_id, id : body.id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_PROGRESO_DESAFIO");
    }
};
const getItemByState = async (req, res) => {
    try {
        req = matchedData(req);
        
        const data = await progresoDesafiosModels.findAll({
            where: { estado: 'ACTIVO' },
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_DESAFIOS");
    }
};


const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const id_logro = req.params.id_desafio;
    try {
        const data = await logrosModels.update(
            objetoACambiar,
            {
                where: { id_logro: id_logro }
            })
        res.send('ok');
    } catch (error) {
        httpError(res, `ERROR_UPDATE_ESTADO_DESAFIO `);
    }
};

const deleteItem = (req, res) => { };

module.exports = {
    getItems, getItem, createItem,  deleteItem, getItemsToDate, patchItem, getItemByState, updateItem, updateItemState, getItemUsuario
}
