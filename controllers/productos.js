const { matchedData } = require('express-validator');
const { productosModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await productosModels.findAll({});
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
        const data = await productosModels.findAll({
            where: { "fecha_creacion": { [Op.between]: [startedDate, endDate] } },
            include: [{
                model: Usuario,
                include: [{
                    model: Empresa
                }]
            }]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM `);
    }
};
const getItemByEmpresa = async (req, res) => {
    console.log("Inicio de la función getItemByEmpresa");
    try {
        req = matchedData(req)
        const { empresa } = req
        const data = await productosModels.findAll({
            where:{
                empresa:[empresa]
            },
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PRODUCTOS_EMPRESA")
    }
};
const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const { id_producto } = req
        const data = await productosModels.findByPk(id_producto);
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_PRODUCT")
    }
};




const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await productosModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_PRODUCT")
    }

};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await productosModels.update(
            {
                pre_estado: body.estado,
            },
            {
                where: { id_producto: body.id_producto },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_PRESTAMO");
    }
};

const patchItem = async (req, res) => {
    console.log("PATCH - Parámetros recibidos:", req.params);
    console.log("PATCH - Body recibido:", req.body);
    console.log("PATCH - ID del producto:", req.params.id_producto);
    
    const objetoACambiar = req.body;
    const id_producto = req.params.id_producto;
    try {
        const data = await productosModels.update(
            objetoACambiar,
            {
                where: { id_producto: id_producto }
            })
        console.log("PATCH - Actualización exitosa:", data);
        res.send('ok');
    } catch (error) {
        console.log("PATCH - Error en actualización:", error);
        httpError(res, `ERROR_UPDATE_ESTADO_PRODUCTO `);
    }
};

const getItemNombre = async (req, res) => {
    try {
        req = matchedData(req)
        const { nombre } = req
        const data = await productosModels.findAll({ where: { nombre: nombre}});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PRODUCTO_NOMBRE")
    }
};
const deleteItem = (req, res) => { };

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem, getItemsToDate, patchItem, getItemNombre, getItemByEmpresa
}
