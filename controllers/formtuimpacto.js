const { matchedData } = require('express-validator');
const { formularioModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await formularioModels.findAll({
            order: [
                ['registro', 'DESC']
            ]
        });
        res.send({data});
    } catch (error) {
        res.status(401).send({error: error.message})
    }
};
const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {form_id} = req
        const data = await formularioModels.findByPk(form_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_FORM")
    }
};
const getItemsToDate = async (req, res) => {
    try {
    const filtro = JSON.parse(req.query.filter);
    const startedDate = new Date(filtro.startDate);
    const endDate = new Date(filtro.endDate);
    const data = await formularioModels.findAll({
        where : {"registro" : {[Op.between] : [startedDate , endDate ]}}
    });
    res.send({data});
} catch (error) {
    httpError(res, `ERROR_GET_FORM `);
}
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await formularioModels.create(body)
        res.send('Item Create Complete')
    } catch (error) {
        httpError(res, `ERROR_CREATE_FORM `)
    }

};

const updateItem = async (req, res) => {

};

const deleteItem = async (req, res) => {
    try {
        const {form_id} = req.params
        const data = await formularioModels.destroy({
            where: { form_id: form_id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_FORM")
    }
};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem, getItemsToDate
}
