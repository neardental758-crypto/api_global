const { matchedData } = require('express-validator');
const { horariosParqeuaderoModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await horariosParqeuaderoModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_HORARIOS");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await horariosParqeuaderoModels.findByPk(id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_HORARIOS")
    }
};

const getItemParqueadero = async (req, res) => {
    try {
        req = matchedData(req)
        const { parqueadero } = req
        const data = await horariosParqeuaderoModels.findAll({ where: { parqueadero: parqueadero}});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_HORARIOS_PARQUEADERO")
    }
};

const createItem = async (req, res) => {
    const { body } = req
    const data = await horariosParqeuaderoModels.create(body)
    res.send({data})
};

const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

module.exports = {
    getItems, createItem, getItem, getItemParqueadero
}
