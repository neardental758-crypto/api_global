const { matchedData } = require('express-validator');
const { desafiosModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await desafiosModels.findAll({});
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
        const data = await dasafiossModels.findAll({
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
        const { id_desafio } = req
        const data = await desafiosModels.findByPk(id_desafio);
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_DESAFIO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await desafiosModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_DESAFIO")
    }

};
const getItemByState = async (req, res) => {
    try {
        req = matchedData(req);
        
        const data = await desafiosModels.findAll({
            where: { estado: 'ACTIVO' },
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_DESAFIOS");
    }
};


const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const id_desafio = req.params.id_desafio;
    try {
        const data = await desafiosModels.update(
            objetoACambiar,
            {
                where: { id_desafio: id_desafio }
            })
        res.send('ok');
    } catch (error) {
        httpError(res, `ERROR_UPDATE_ESTADO_DESAFIO `);
    }
};
const updateItemState = async (req, res) => {
    try {
        const { body } = req
        const data = await desafiosModels.update(
            {
                estado: body.estado,
            },
            {
                where: { id_desafio : body.id_desafio },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_DESAFIO");
    }
};

const deleteItem = (req, res) => { };

module.exports = {
    getItems, getItem, createItem,  deleteItem, getItemsToDate, patchItem, getItemByState, updateItemState
}
