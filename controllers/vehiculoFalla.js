const { matchedData } = require('express-validator');
const { vehiculoFallaModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await vehiculoFallaModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_VEHICULO_FALLA");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {vef_id} = req
        const data = await vehiculoFallaModels.findByPk(vef_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_VEHICULO_FALLA")
    }
};

const getItemUsuario = async (req, res) => {
    try {
        req = matchedData(req)
        const { vef_usuario } = req
        const data = await vehiculoFallaModels.findAll({ where: { vef_usuario: vef_usuario, vef_estado: 'ACTIVA' }});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_VEHICULO_FALLA_USUARIO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await vehiculoFallaModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_VEHICULO_FALLA")
    }

};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await vehiculoFallaModels.update(
            {
                vef_estado: body.estado,
            },
            {
                where: { res_id : body.vef_id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_VEHICULO_FALLA");
    }
};

const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, getItemUsuario, createItem, updateItem, deleteItem
}
