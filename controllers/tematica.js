const { Op, where } = require('sequelize');
const { sequelize } = require('../config/mysql');
const { v4: uuidv4 } = require('uuid');
const { matchedData } = require('express-validator');
const { tematicaModel } = require('../models');
const { httpError } = require('../utils/handleError');
const Contenido = require('../models/mysql/contenido');
const PreguntasBrain = require('../models/mysql/preguntasBrain');
const RespuestaBrain = require('../models/mysql/respuestaBrain');

const getItems = async (req, res) => {
    try {
        const data = await tematicaModel.findAll({
            where: { tematica_activa: true },
            include: [{
                model: Contenido,
                include: [{
                    model: PreguntasBrain,
                    as : 'preguntas',
                    include: [{
                        model: RespuestaBrain,
                        as : 'respuestas'
                    }]
                }]
            }]
        });
        res.send({data});
    } catch (error) {
        httpError(res, `ERROR_GET_TEMATICA ${error}`);
    }
};

const getAllTematicas = async (req, res) => {
    try {
        const data = await tematicaModel.findAll({
            include: [{
                model: Contenido,
                include: [{
                    model: PreguntasBrain,
                    as : 'preguntas',
                    include: [{
                        model: RespuestaBrain,
                        as : 'respuestas'
                    }]
                }]
            }]
        });
        res.send({data});
    } catch (error) {
        httpError(res, `ERROR_GET_TEMATICA ${error}`);
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await tematicaModel.findOne({
            where: { id: id },
            include: [{
                model: Vehiculo
            }]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_TEMATICA ${e}` )
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req;
        const newTematica = {
            ...body
        };
        const data = await tematicaModel.create(newTematica)
        res.send(data)
    } catch (error) {
        httpError(res, `ERROR_CREATE_TEMATICA ${error}`)
    }

};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const id = req.params._id;
    try {
        const data = await tematicaModel.update(
        objetoACambiar,
        {
            where: { _id: id }
        })
        let actual = await tematicaModel.findOne({
            where: { _id: id },
        });
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update TEMATICA"
            });
        }else{
            res.json({
                message: "Update TEMATICA failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_TEMATICA ${error}`);
    }
};

const deleteItem = async (req, res) => {
    try {
        const { _id } = req.params
        const data = await tematicaModel.destroy({
            where: { _id : _id },
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_TEMATICA")
    }
};


module.exports = {
    getItems, getItem, createItem, patchItem, deleteItem, getAllTematicas
}
