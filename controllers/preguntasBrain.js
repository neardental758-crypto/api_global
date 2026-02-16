const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');
const { v4: uuidv4 } = require('uuid');
const { matchedData } = require('express-validator');
const { preguntasBrainModel } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        const data = await preguntasBrainModel.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_PREGUNTASBRAIN");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await preguntasBrainModel.findOne({
            where: { id: id },
            include: [{
                model: Vehiculo
            }]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_PREGUNTASBRAIN ${e}` )
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req;
        const newBrainQuestion = {
            ...body
        };
        const data = await preguntasBrainModel.create(newBrainQuestion)
        res.send(data)
    } catch (error) {
        httpError(res, `ERROR_CREATE_PREGUNTASBRAIN ${error}`)
    }

};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const id = req.params._id;
    try {
        const data = await preguntasBrainModel.update(
        objetoACambiar,
        {
            where: { _id: id }
        })
        let actual = await preguntasBrainModel.findOne({
            where: { _id: id },
        });
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update PREGUNTASBRAIN"
            });
        }else{
            res.json({
                message: "Update PREGUNTASBRAIN failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_PREGUNTASBRAIN ${error}`);
    }
};

const deleteItem = async (req, res) => {
    try {
        const { _id } = req.params
        const data = await preguntasBrainModel.destroy({
            where: { _id : _id },
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_PREGUNTASBRAIN")
    }
};


module.exports = {
    getItems, getItem, createItem, patchItem, deleteItem
}
