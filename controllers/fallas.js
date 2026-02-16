const { matchedData } = require('express-validator');
const { fallasModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await fallasModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_FALLA");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {fal_id} = req
        const data = await fallasModels.findByPk(fal_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_FALLA")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await fallasModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_GET_FALLA")
    }

};

const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem
}
