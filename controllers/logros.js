const { matchedData } = require('express-validator');
const { logrosModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await logrosModels.findAll({});
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
        const data = await logrosModels.findAll({
            where: { "fecha_creacion": { [Op.between]: [startedDate, endDate] } },
        });
        res.send({ data });
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM `);
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const { id_logro } = req
        const data = await logrosModels.findByPk(id_logro);
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_DESAFIO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await logrosModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_DESAFIO")
    }

};
const getItemByState = async (req, res) => {
    try {
        req = matchedData(req);
        
        const data = await logrosModels.findAll({
            where: { estado: 'ACTIVO' },
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_DESAFIOS");
    }
};


const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const id_logro = req.params.id_logro;
    try {
        const data = await logrosModels.update(
            objetoACambiar,
            {
                where: { id_logro: id_logro }
            })
        res.send('ok');
    } catch (error) {
        httpError(res, `ERROR_UPDATE_ESTADO_LOGRO`);
    }
};
const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await logrosModels.update(
            {
                estado: body.estado,
            },
            {
                where: { id_logro : body.id_logro },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_PRESTAMO");
    }
};

const deleteItem = (req, res) => { };

module.exports = {
    getItems, getItem, createItem,  deleteItem, getItemsToDate, patchItem, getItemByState
}
