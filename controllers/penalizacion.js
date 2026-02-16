const { matchedData } = require('express-validator');
const { penalizacionModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await penalizacionModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_PENALIZACION");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {pen_id} = req
        const data = await penalizacionModels.findByPk(pen_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PENALIZACION")
    }
};

const getItemUser = async (req, res) => {
    try {
        req = matchedData(req)
        const { pen_usuario } = req
        const data = await penalizacionModels.findAll({ where: { pen_usuario: pen_usuario, pen_estado: 'ACTIVA'}});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PENALIZACIONES_USUARIO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await penalizacionModels.create(body)
        res.send('ok');
    } catch (e) {
        httpError(res, "ERROR_CREATE_PENALIZACIONES")
    }
};

const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, getItemUser, createItem, updateItem, deleteItem
}
