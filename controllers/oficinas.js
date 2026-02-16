const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');
const { matchedData } = require('express-validator');
const { oficinasModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        const data = await oficinasModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_OFICINAS");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {_id} = req
        const data = await oficinasModels.findOne({
            where: { _id: _id },
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_OFICINAS ${e}` )
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await oficinasModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_OFICINAS")
    }

};
const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await oficinasModels.update(
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
        httpError(res, "ERROR_UPDATE_OFICINAS");
    }
};


const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const _id = req.params._id;
    try {
        const data = await oficinasModels.update(
        objetoACambiar,
        {
            where: { _id: _id }
        })
        let actual = await oficinasModels.findOne({
            where: { _id: _id },
        });
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update OFICINAS"
            });
        }else{
            res.json({
                message: "Update OFICINAS failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_OFICINAS`);
    }
};

const deleteItem = async (req, res) => {
    try {
        const {_id} = req.params
        const data = await oficinasModels.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_OFICINAS")
    }
};


module.exports = {
    getItems, getItem, createItem, updateItem, patchItem, deleteItem,
}
