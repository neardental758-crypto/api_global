const { matchedData } = require('express-validator');
const { ticketsModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await ticketsModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_ESTADOS");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {tic_id} = req
        const data = await ticketsModels.findByPk(tic_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_USER")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await ticketsModels.create(body)
        res.send('ok');
    } catch (e) {
        httpError(res, "ERROR_CREATE_PENALIZACIONES")
    }

};

const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem
}
