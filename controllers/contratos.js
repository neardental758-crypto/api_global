const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');
const { matchedData } = require('express-validator');
const { contratosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Empresa = require('../models/mysql/empresa');

const getItems = async (req, res) => {
    try {
        const data = await contratosModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_CONTRATOS");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {_id} = req
        const data = await contratosModels.findOne({
            where: { _id: _id },
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_CONTRATOS ${e}` )
    }
};

const getItemsFilterOrganization = async (req, res) => {
    req = matchedData(req)
    const { organizationId } = req
    try {
        const data = await contratosModels.findAll({
            where : {
                idOrganizacion : organizationId
            }
        });
        res.send({data});
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM_CONTRATOS`);
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await contratosModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_CONTRATOS")
    }

};
const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await contratosModels.update(
            {
                //data a cambiar

            },
            {
                //Identificador
                where: { _id : body._id },
            }
        )
        res.send('Item Update Complete');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_CONTRATOS");
    }
};


const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const fechaUpdate = new Date().toISOString();
    const _id = req.params._id;
    objetoACambiar.fechaUpdate = fechaUpdate;
    try {
        let actual = await contratosModels.findOne({
            where: { _id: _id },
        });
        if (actual) {
            actual.vecesRenovado = (actual.vecesRenovado || 0) + 1;
            const updatedData = {
                ...objetoACambiar,
                vecesRenovado: actual.vecesRenovado
            };
            const result = await contratosModels.update(updatedData, {
                where: { _id: _id }
            });
            if (result[0] > 0) {
                res.status(200).json({
                    status: 200,
                    data: updatedData,
                    message: "Update CONTRATOS"
                });
            } else {
                res.json({
                    message: "Update CONTRATOS failed: No rows affected"
                });
            }
        } else {
            res.json({
                message: "Update CONTRATOS failed: Item not found"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_CONTRATOS`);
    }
};


const deleteItem = async (req, res) => {
    try {
        const {_id} = req.params
        const data = await contratosModels.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_CONTRATOS")
    }
};


module.exports = {
    getItems, getItem, createItem, updateItem, patchItem, deleteItem, getItemsFilterOrganization
}
