const { matchedData } = require('express-validator');
const { compartidoSolicitudNoEncontradaModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Usuario = require('../models/mysql/usuario');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await compartidoSolicitudNoEncontradaModels.findAll({
            include:[{
                model: Usuario,
                attributes: ['usu_documento', 'usu_nombre', 'usu_img', 'usu_calificacion'],
            }]
        });
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOSOLICITUD");
    }
};

const getItemsPendientes = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await compartidoSolicitudNoEncontradaModels.findAll({
            where: { estado: 'PENDIENTE' }
        });
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOSOLICITUD");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await compartidoSolicitudNoEncontradaModels.findByPk(id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMPARTIDOSOLICITUD")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoSolicitudNoEncontradaModels.create(body)
        res.send('Item Create Complete')
    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOSOLICITUDNOENCONTRADA ${error}`)
    }
};

const patchItem = async (req, res) => {
    try {
        const objetoACambiar = req.body;
        
        console.log('Datos recibidos para actualizar:', objetoACambiar);
        
        // Primero verificar si existe el registro
        const existe = await compartidoSolicitudNoEncontradaModels.findByPk(objetoACambiar.id);
        
        if (!existe) {
            return res.status(404).send({ 
                error: 'No se encontró la solicitud para actualizar',
                id: objetoACambiar.id
            });
        }
        
        console.log('Registro encontrado:', existe.toJSON());
        
        // Actualizar el registro
        const [rowsUpdated] = await compartidoSolicitudNoEncontradaModels.update(
            {
                estado: objetoACambiar.estado,
            },
            {
                where: { id: objetoACambiar.id }
            }
        );
        
        console.log('Filas actualizadas:', rowsUpdated);
        
        if (rowsUpdated === 0) {
            return res.status(400).send({ 
                error: 'No se pudo actualizar la solicitud' 
            });
        }
        
        res.status(200).send({ 
            message: 'Estado actualizado correctamente',
            updated: rowsUpdated,
            id: objetoACambiar.id,
            nuevoEstado: objetoACambiar.estado
        });
        
    } catch (error) {
        console.error('Error en patchItem:', error);
        httpError(res, `ERROR_UPDATE_COMPARTIDOSOLICITUDPENDIENTEPATCH: ${error.message}`);
    }
};

const deleteItem = async (req, res) => {
    try {
        const {id} = req.params
        const data = await compartidoSolicitudNoEncontradaModels.destroy({
            where: { id: id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_COMPARTIDOSOLICITUD")
    }
};


module.exports = {
    getItems, getItem, createItem, patchItem, deleteItem, getItemsPendientes
}
