const { matchedData } = require('express-validator');
const { indicadoresModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const Estacion = require('../models/mysql/estacion');
const Empresa = require('../models/mysql/empresa');
const Bicicleta = require('../models/mysql/bicicletas');
const Prestamo = require('../models/mysql/prestamos');
const { httpError } = require('../utils/handleError');
const { Op, Sequelize } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await indicadoresModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_INDICADORESS");
    }
};

const getItemTrip = async (req, res) => {
    try {
        req = matchedData(req)
        const { ind_viaje } = req
        const data = await indicadoresModels.findOne({
            where:  {ind_viaje: ind_viaje}
        });
        res.send(data);
    } catch (e) {
        httpError(res, "ERROR_GET_INDICADORES_TRIP")
    }
};

const getItemsUser = async (req, res) => {
    try {
        req = matchedData(req)
        const { ind_usuario } = req
        const data = await indicadoresModels.findAll({
            where:  {ind_usuario: ind_usuario}
        });
        res.send(data);
    } catch (e) {
        httpError(res, "ERROR_GET_INDICADORES_USER")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await indicadoresModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_INDICADORES")
    }

};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const ind_id = req.params.ind_id;
    try {
        const data = await indicadoresModels.update(
        objetoACambiar,
        {
            where: { ind_id: ind_id }
        })
        res.send('ok');
    } catch (error) {
        httpError(res, `ERROR_UPDATE_ESTADO_INDICADORES `);
    }
};
const getItemsWithPrestamos = async (req, res) => {
    try {
        const data = await indicadoresModels.findAll({
            include: [{
                model: Prestamo,
                as: 'prestamo',
                required: false,
                where: {
                    pre_id: Sequelize.col('bc_indicadores_trip.ind_viaje')
                },
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        required: true,
                        attributes: [
                            'usu_ciudad',
                            'usu_nombre',
                            'usu_documento',
                            'usu_empresa',
                            'usu_viajes',
                            'usu_creacion',
                        ],
                        include: [{
                            model: Empresa,
                            as: 'organizacion',
                            attributes: ['emp_id']
                        }]
                    },
                    {
                        model: Bicicleta,
                        as: 'bicicleta',
                        required: false,
                        attributes: [
                            'bic_nombre',
                            'bic_numero',
                            'bic_estacion'
                        ]
                    }
                ]
            }]
        });
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_INDICADORES_WITH_PRESTAMOS");
    }
};

const getItemsWithPrestamosByEmpresa = async (req, res) => {
    try {
        const { empresaId } = req.params;

        const empresa = await Empresa.findOne({
            where: { emp_id: empresaId }
        });

        if (!empresa) {
            return res.send({ data: [] });
        }

        const data = await indicadoresModels.findAll({
            include: [{
                model: Prestamo,
                as: 'prestamo',
                required: false,
                where: {
                    pre_id: Sequelize.col('bc_indicadores_trip.ind_viaje')
                },
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        required: true,
                        where: {
                            usu_empresa: empresa.emp_nombre
                        },
                        attributes: [
                            'usu_ciudad',
                            'usu_nombre',
                            'usu_documento',
                            'usu_empresa',
                            'usu_viajes',
                            'usu_creacion',
                        ],
                        include: [{
                            model: Empresa,
                            as: 'organizacion',
                            attributes: ['emp_id']
                        }]
                    },
                    {
                        model: Bicicleta,
                        as: 'bicicleta',
                        required: false,
                        attributes: [
                            'bic_nombre',
                            'bic_numero',
                            'bic_estacion'
                        ]
                    }
                ]
            }]
        });

        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_INDICADORES_WITH_PRESTAMOS_BY_EMPRESA");
    }
};

const getItemWithPrestamo = async (req, res) => {
    try {
        const { ind_id } = matchedData(req);
        const data = await indicadoresModels.findOne({
            where: { ind_id },
            include: [{
                model: Prestamo,
                required: true,
                where: {
                    pre_id: Sequelize.col('ind_viaje')
                }
            }]
        });
        
        if (!data) {
            return res.status(404).send({ error: "INDICADOR_NOT_FOUND" });
        }
        
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_INDICADOR_WITH_PRESTAMO");
    }
};

const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItemTrip, getItemsUser, createItem, deleteItem, patchItem, getItemsWithPrestamos,getItemWithPrestamo, getItemsWithPrestamosByEmpresa
}
