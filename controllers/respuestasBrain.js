const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');
const { v4: uuidv4 } = require('uuid');
const { matchedData } = require('express-validator');
const { respuestaBrainModel } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        const data = await respuestaBrainModel.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_RESPUESTASBRAIN");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await respuestaBrainModel.findOne({
            where: { id: id },
            include: [{
                model: Vehiculo
            }]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_RESPUESTASBRAIN ${e}` )
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req;
        const newBrainAnswer = {
            ...body
        };
        const data = await respuestaBrainModel.create(newBrainAnswer)
        res.send(data)
    } catch (error) {
        httpError(res, `ERROR_CREATE_RESPUESTASBRAIN ${error}`)
    }

};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const id = req.params._id;
    try {
        const data = await respuestaBrainModel.update(
        objetoACambiar,
        {
            where: { _id: id }
        })
        let actual = await respuestaBrainModel.findOne({
            where: { _id: id },
        });
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update RESPUESTASBRAIN"
            });
        }else{
            res.json({
                message: "Update RESPUESTASBRAIN failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_RESPUESTASBRAIN ${error}`);
    }
};

const deleteItem = async (req, res) => {
    try {
        const { _id } = req.params
        const data = await respuestaBrainModel.destroy({
            where: { _id : _id },
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_RESPUESTASBRAIN")
    }
};


module.exports = {
    getItems, getItem, createItem, patchItem, deleteItem
}
