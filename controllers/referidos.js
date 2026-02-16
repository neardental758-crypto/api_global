const { matchedData } = require('express-validator');
const { referidosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Usuario = require('../models/mysql/usuario');
const _id_cortezza = '627a8c9931feb31c33377d0e';
const nombre_cortezza = 'Cortezza MDN';
const nodemailer = require("nodemailer");

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await referidosModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_PUNTOS");
    }
};

const getItemUser = async (req, res) => {
    try {
        req = matchedData(req)
        const { usuario } = req  // Cambiar de pun_usuario a usuario
        const data = await referidosModels.findAll({ where: { usuario: usuario }}); // Cambiar puntosModels por referidosModels
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_REFERIDOS_USUARIO")
    }
};

const getItemCod = async (req, res) => {
    try {
        req = matchedData(req)
        const { codigo } = req  // Cambiar de pun_usuario a usuario
        const data = await referidosModels.findOne({ where: { codigo: codigo }}); // Cambiar puntosModels por referidosModels
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_REFERIDOS_USUARIO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await referidosModels.create(body) // Cambiar puntosModels por referidosModels
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_REFERIDOS")
    }
};

const updateItem = async (req, res) => {};

const deleteItem = (req, res) => {};


const updateReferido = async (req, res) => {
    try {
        const { usuario, referente } = req.body;
        
        await referidosModels.update(
            { referente: referente },
            { where: { usuario: usuario } }
        );
        
        res.send({ message: 'Refernete actualizado' });
    } catch (e) {
        console.error(e);
        httpError(res, "ERROR_UPDATE_RECOMPENSA");
    }
};

module.exports = {
    getItems, getItemUser, getItemCod, createItem, updateItem, deleteItem, updateReferido
}
