const { matchedData } = require('express-validator');
const { historialesModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Estacion = require('../models/mysql/estacion');
const Empresa = require('../models/mysql/empresa');
const Bicicleta = require('../models/mysql/bicicletas');
const { bicicleterosModels } = require("../models");
const { sequelize } = require('../config/mysql');


const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await historialesModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_HISTORIALES");
    }
};

const getItemChangeKey = async (req, res) => {
    try {
        const data = await historialesModels.findAll({
            where: { his_estado : 'CAMBIAR CLAVE' },
            include:[{
                model: Bicicleta,
                attributes: ['bic_numero'],
              },
              {
                model: Estacion,
                attributes: ['est_estacion', 'est_empresa'],
                include:[{
                    model: Empresa,
                    attributes: ['emp_id', 'emp_nombre'],
                 }],
            }],
            order: [
                ['his_fecha', 'DESC']
            ]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_BICI_ESTACION_NOMBRE ${e}`)
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {his_id} = req
        const data = await historialesModels.findByPk(his_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_HISTORIALES")
    }
};


const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await historialesModels.create(body)
        res.status(200)
    } catch (error) {
        httpError(res, "ERROR_CREATE_HISTORIALES")
    }

};

const getItemLastTen = async (req, res) => {
    try {
        req = matchedData(req);
        const { his_bicicleta } = req;
        const data = await historialesModels.findAll({
            where: { his_bicicleta },
            limit: 10,
            order: [['his_fecha', 'DESC']],
            include: [{
                model: Estacion,
                attributes: ['est_estacion'],
                include: [{
                    model: Empresa,
                    attributes: ['emp_nombre'],
                }],
            }]
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_LAST_TEN_HISTORIALES");
    }
};

const updateItem = async (req, res) => {
    try {
        const { body } = req;
        
        const historial = await historialesModels.findOne({
            where: { his_id: body.his_id }
        });
        
        if (!historial) {
            return res.status(404).json({success: false, message: 'Historial no encontrado'});
        }
        
        const data = await historialesModels.update(
            {
                his_estado: body.his_estado,
            },
            {
                where: { his_id: body.his_id }
            }
        );
        
        if (body.his_estado === 'FINALIZADA' && historial.his_clave_new) {
            await bicicleterosModels.update(
                { bro_clave: historial.his_clave_new },
                { 
                    where: { bro_bicicleta: historial.his_bicicleta }
                }
            );
        }
        
        res.status(200).json({success: true, data});
        
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_HISTORIALES");
    }
};


const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem, getItemChangeKey, getItemLastTen
}
