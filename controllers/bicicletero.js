const { matchedData } = require('express-validator');
const { and } = require('sequelize');
const { bicicleterosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Estacion = require('../models/mysql/estacion');
const _id_cortezza = '627a8c9931feb31c33377d0e';
const nombre_cortezza = 'Cortezza MDN';

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await bicicleterosModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_BICICLETERO");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {bro_id} = req
        const data = await bicicleterosModels.findByPk(bro_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_BICICLETERO")
    }
};

const updateKey = async (req, res) => {
    try {
        const { body } = req;

        // Construir objeto de actualización dinámicamente
        let updateData = { bro_clave: body.bro_clave };

        if (body.bro_estacion !== undefined) {
            updateData.bro_estacion = body.bro_estacion;
        }

        const data = await bicicleterosModels.update(updateData, {
            where: { bro_id: body.bro_id },
        });

        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_RESERVA");
    }
};

const getItemClave = async (req, res) => {
    try {
        req = matchedData(req)
        const { bro_estacion, bro_bicicleta } = req
        const data = await bicicleterosModels.findAll({
            where: { bro_estacion: bro_estacion,
                bro_bicicleta: bro_bicicleta }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_BICI_BICICLETERO_CLAVE")
    }
};

const getItemEmpresa = async (req, res) => {
    try {
        req = matchedData(req)
        const { Empresa } = req
        const data = await bicicleterosModels.findAll({ where: { Empresa: Empresa}});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_ESTACION_EMPRESA")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
    const data = await bicicleterosModels.create(body)
    res.send({data})
    } catch (e) {
        httpError(res, `ERROR_SET_BICICLETERO`)
        
    }
};

const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

const getItemClave_cortezza  = async (req, res) => {
    try {
        req = matchedData(req)
        const { bro_estacion, bro_bicicleta } = req
        const data = await bicicleterosModels.findAll({
            where: { 
                bro_estacion: bro_estacion,
                bro_bicicleta: bro_bicicleta 
            },
            include: [
                {
                    model: Estacion,
                    attributes: ['est_empresa'],
                    where: {
                        est_empresa: nombre_cortezza,
                    },
                },
            ],
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_BICI_BICICLETERO_CLAVE_CORTEZZA")
    }
};

module.exports = {
    getItems, getItem, getItemClave, getItemEmpresa, createItem, updateItem, deleteItem, updateKey, getItemClave_cortezza
}
