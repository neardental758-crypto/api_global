const { matchedData } = require('express-validator');
const { horariosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const _id_cortezza = '627a8c9931feb31c33377d0e';
const nombre_cortezza = 'Cortezza MDN';

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await horariosModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_BICICLETA");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {hor_id} = req
        const data = await horariosModels.findByPk(hor_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_HORARIO")
    }
};

const getItemEmpresa = async (req, res) => {
    try {
        req = matchedData(req)
        const { hor_empresa } = req
        const data = await horariosModels.findAll({ where: { hor_empresa: hor_empresa}});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_ESTACION_HORARIO")
    }
};

const createItem = async (req, res) => {
    const { body } = req
    const data = await horariosModels.create(body)
    res.send({data})
};

const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

const getItemEmpresa_cortezza = async (req, res) => {
    try {
        req = matchedData(req)
        const { hor_empresa } = req
        const data = await horariosModels.findAll({ 
            where: { 
                hor_empresa: hor_empresa,
                hor_empresa: nombre_cortezza
            }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_ESTACION_HORARIO")
    }
};

module.exports = {
    getItems, createItem, getItem, getItemEmpresa, getItemEmpresa_cortezza
}
