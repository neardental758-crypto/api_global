const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');
const { matchedData } = require('express-validator');
const { participantesActividadesModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await participantesActividadesModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GETPARTICIPANTES_ACTIVIDADES");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await participantesActividadesModels.findOne({
            where: { id: id },
            include: [{
                model: Vehiculo
            }]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GETPARTICIPANTES_ACTIVIDADES ${e}` )
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await participantesActividadesModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATEPARTICIPANTES_ACTIVIDADES")
    }

};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const id = req.params.id;
    try {
        const data = await participantesActividadesModels.update(
        objetoACambiar,
        {
            where: { id: id }
        })
        let actual = await participantesActividadesModels.findOne({
            where: { id: id },
            include: [{
                model: Vehiculo
            }]
        });
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update actividades"
            });
        }else{
            res.json({
                message: "Update actividades failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATEPARTICIPANTES_ACTIVIDADES`);
    }
};

const deleteItem = async (req, res) => {
    try {
        const {id} = req.params
        const data = await participantesActividadesModels.destroy({
            where: { id: id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETEPARTICIPANTES_ACTIVIDADES")
    }
};


module.exports = {
    getItems, getItem, createItem, patchItem, deleteItem
}
