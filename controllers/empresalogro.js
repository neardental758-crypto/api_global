const { matchedData } = require('express-validator');
const { empresaLogroModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');
const logrosModels = require('../models/mysql/logros');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await empresaLogroModels.findAll({});
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_PRODUCTOS");
    }
};

const getItemsToDate = async (req, res) => {
    try {
        const filtro = JSON.parse(req.query.filter);
        const startedDate = new Date(filtro.startDate);
        const endDate = new Date(filtro.endDate);
        const data = await empresaLogroModels.findAll({
            where: { "fecha_creacion": { [Op.between]: [startedDate, endDate] } },
        });
        res.send({ data });
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM `);
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await empresaLogroModels.findByPk(id);
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_DESAFIO")
    }
};

const getItemtoEmpresa = async (req, res) => {
    try {
        req = matchedData(req)
        const {idEmpresa } = req
        const data = await empresaLogroModels.findAll({
            where: { idEmpresa: idEmpresa, estado: 'ACTIVO' },
            include: [
                {
                    model: logrosModels,
                    as: 'logro',
                    attributes: ['descripcion']
                }
            ]
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_DESAFIO")
    }
};

const getItemlogroAndEmpresa = async (req, res) => {
    try {
        req = matchedData(req)
        const { idLogro, idEmpresa } = req
        const data = await empresaLogroModels.findAll({
            where: { idEmpresa: idEmpresa, idLogro: idLogro },
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_DESAFIO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await empresaLogroModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_DESAFIO")
    }
};
const getItemByState = async (req, res) => {
    try {
        req = matchedData(req);
        
        const data = await empresaLogroModels.findAll({
            where: { estado: 'ACTIVO' },
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_DESAFIOS");
    }
};


const patchItem = async (req, res) => {
    console.log("ID desde params:", req.params.id);
    console.log("Body completo:", req.body);
    console.log("Validación ID:", typeof req.params.id);
    
    const objetoACambiar = req.body;
    const id = req.params.id;
    try {
        const data = await empresaLogroModels.update(
            objetoACambiar,
            {
                where: { id: id }
            })
        res.send('ok');
    } catch (error) {
        httpError(res, `ERROR_UPDATE_ESTADO_DESAFIO `);
    }
};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await empresaLogroModels.update(
            {
                estado: body.estado,
            },
            {
                where: { id : body.id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_PRESTAMO");
    }
};
const getItemtoEmpresaWithLogro = async (req, res) => {
    try {
        req = matchedData(req)
        const {idEmpresa } = req
        const data = await empresaLogroModels.findAll({
            where: { idEmpresa: idEmpresa },
            include: [
                {
                    model: logrosModels,
                    as: 'logro',
                    attributes: ['descripcion']
                }
            ]
        });

        console.log('EL LOGRO DATA', data)
        
        const formattedData = data.map(item => ({
            ...item.dataValues,
            logro_descripcion: item.logro ? item.logro.descripcion : 'Sin descripción'
        }));
        
        res.send({ data: formattedData });
    } catch (e) {
        httpError(res, "ERROR_GET_EMPRESA_LOGRO_DASHBOARD")
    }
};


const deleteItem = (req, res) => { };

module.exports = {
    getItems, getItem, createItem,  deleteItem, getItemsToDate, patchItem, getItemByState, getItemtoEmpresa, getItemtoEmpresaWithLogro, 
}
