const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');
const { v4: uuidv4 } = require('uuid');
const { matchedData } = require('express-validator');
const { contenidoModel } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        const data = await contenidoModel.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_CONTENIDO");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await contenidoModel.findOne({
            where: { id: id },
            include: [{
                model: Vehiculo
            }]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_CONTENIDO ${e}` )
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req;
        const newTematica = {
            ...body
        };
        const data = await contenidoModel.create(newTematica)
        res.send(data)
    } catch (error) {
        httpError(res, `ERROR_CREATE_CONTENIDO ${error}`)
    }

};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const id = req.params._id;
    try {
        const data = await contenidoModel.update(
        objetoACambiar,
        {
            where: { _id: id }
        })
        let actual = await contenidoModel.findOne({
            where: { _id: id },
        });
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update CONTENIDO"
            });
        }else{
            res.json({
                message: "Update CONTENIDO failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_CONTENIDO ${error}`);
    }
};

const deleteItem = async (req, res) => {
    try {
        const { _id } = req.params
        const data = await contenidoModel.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, `ERROR_DELETE_CONTENIDO ${e}`)
    }
};


module.exports = {
    getItems, getItem, createItem, patchItem, deleteItem
}
