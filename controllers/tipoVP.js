const { matchedData } = require('express-validator');
const { tipoVPModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await tipoVPModels.findAll({
            where : { tip_mostrar : 1 }
        });
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_TIPOVP");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {tip_id} = req
        const data = await tipoVPModels.findByPk(tip_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_TIPO")
    }
};

const createItem = async (req, res) => {
    const { body } = req
    const data = await tipoVPModels.create(body)
    res.send({data})
};

const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem
}
