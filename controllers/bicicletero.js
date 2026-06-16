const { matchedData } = require('express-validator');
const { bicicletasModels, bicicleterosModels } = require('../models');
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

        // Sync with Bicicleta table if possible
        let bicicletero = await bicicleterosModels.findByPk(body.bro_id);
        
        // If not found by PK, it might be the bicycle ID (due to integration)
        if (!bicicletero) {
            bicicletero = await bicicleterosModels.findOne({
                where: { bro_bicicleta: body.bro_id }
            });
        }

        if (bicicletero && bicicletero.bro_bicicleta) {
            await bicicletasModels.update({
                bic_clave: body.bro_clave
            }, {
                where: { bic_id: bicicletero.bro_bicicleta }
            });
        } else {
            // If we only have the ID (which might be the bic_id), update the bicycle directly
            await bicicletasModels.update({
                bic_clave: body.bro_clave
            }, {
                where: { bic_id: body.bro_id }
            });
        }

        // Maintain original table for now
        let updateData = { bro_clave: body.bro_clave };
        if (body.bro_estacion !== undefined) {
            updateData.bro_estacion = body.bro_estacion;
        }

        const targetId = bicicletero ? bicicletero.bro_id : body.bro_id;
        const data = await bicicleterosModels.update(updateData, {
            where: { bro_id: targetId },
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

        // Try to get from Bicicleta table first
        const bike = await bicicletasModels.findOne({
            where: { 
                bic_id: bro_bicicleta,
                bic_estacion: bro_estacion 
            }
        });

        if (bike && bike.bic_clave) {
            const data = [{
                bro_id: bike.bic_id, // Compatibility
                bro_bluetooth: bike.bic_bluetooth,
                bro_clave: bike.bic_clave,
                bro_bicicleta: bike.bic_id,
                bro_estacion: bike.bic_estacion
            }];
            return res.send({ data });
        }

        // Fallback to original table
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

const getItemsByEstacion = async (req, res) => {
    try {
        req = matchedData(req);
        const { bro_estacion } = req;
        const data = await bicicleterosModels.findAll({
            where: { bro_estacion: bro_estacion },
            include: [{
                model: bicicletasModels,
                required: false
            }]
        });
        res.send({ data });
    } catch (error) {
        console.error(error);
        httpError(res, "ERROR_GET_BICICLETEROS_BY_ESTACION");
    }
};

module.exports = {
    getItems, getItem, getItemClave, getItemEmpresa, createItem, updateItem, deleteItem, updateKey, getItemClave_cortezza, getItemsByEstacion
}
