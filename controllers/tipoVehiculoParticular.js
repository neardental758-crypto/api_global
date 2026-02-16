const { matchedData } = require('express-validator');
const { tipoVehiculosParticularModels } = require('../models');
const { httpError } = require('../utils/handleError');

/**
 * funcion getItems donde se requiere el modelo de esta colección
 * utilizamos try catch para manejo de errores
 * se requiere el userModel donde se estructura la lógica de la colleción
 * @param {*} req
 * @param {*} res
 */
const getItems = async (req, res) => {
    try {
        const a = req.a
        const data = await tipoVehiculosParticularModels.find({});
        res.send({data, a});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await tipoVehiculosParticularModels.findByPk(id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_USER")
    }
};

const createItem = async (req, res) => {
    const { body } = req
    const data = await tipoVehiculosParticularModels.create(body)
    res.send({data})
};

const updateItem = (req, res) => {};

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await tipoVehiculosParticularModels.deleteOne({_id:id});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_DELETE_USER")
    }
};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem
}
