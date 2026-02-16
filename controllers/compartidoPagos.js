const { matchedData } = require('express-validator');
const Usuario = require('../models/mysql/usuario');
const Solicitud = require('../models/mysql/compartidoSolicitud');
const { compartidoPagosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await compartidoPagosModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOPAGOS");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {_id} = req
        const data = await compartidoPagosModels.findByPk(_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMPARTIDOPAGOS")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoPagosModels.create(body)
        res.send('Item Create Complete')
    } catch (error) {
        httpError(res, "ERROR_CREATE_COMPARTIDOPAGOS")
    }

};

const getItemsTrip = async (req, res) => {
    try {
        req = matchedData(req)
        const { idViaje } = req
        const data = await compartidoPagosModels.findAll({
            where: { idViaje : idViaje},
            include:[{
                model: Usuario,
                attributes: ['usu_documento', 'usu_nombre', 'usu_img', 'usu_calificacion'],
            },
            {
                model: Solicitud,
                attributes: ['estadoSolicitud'],
                where: {
                    estadoSolicitud: { [Op.not]: 'CANCELADA' },
                },
                required: true
            },
        ]
             
        })
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_PAGOS_TRIP " + error);
    }
};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoPagosModels.update(
            {
                //data a cambiar
                nombre : body.nombre,
                cantidadViajes : (body.cantidadViajes)+1
            },
            {
                //Identificador
                where: { _id : body._id },
            }
        )
        res.send('Item Update Complete');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_COMPARTIDOPAGOS");
    }
};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const _id = req.params._id;
    try {
        const data = await compartidoPagosModels.update(
        objetoACambiar,
        {
            where: { _id: _id }
        })
        let actual = await compartidoPagosModels.findByPk(_id);
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update COMPARTIDOPAGOS"
            });
        }else{
            res.json({
                message: "Update COMPARTIDOPAGOS failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOPAGOS `);
    }
};

const deleteItem = async (req, res) => {
    try {
        const {_id} = req.params
        const data = await compartidoPagosModels.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_COMPARTIDOPAGOS")
    }
};

module.exports = {
    getItems, getItem, createItem, updateItem, patchItem, deleteItem, getItemsTrip
}