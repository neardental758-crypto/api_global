const { matchedData } = require('express-validator');
const { estadosModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await estadosModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_ESTADOS");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {est_id} = req
        const data = await estadosModels.findByPk(est_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_USER")
    }
};

const createItem = async (req, res) => {
    const { body } = req
    const data = await estadosModels.create(body)
    res.send({data})
};

const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem
}
