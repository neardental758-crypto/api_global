const { matchedData } = require('express-validator');
const { preoperacionalesModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const Estacion = require('../models/mysql/estacion');
const Empresa = require('../models/mysql/empresa');
const Bicicleta = require('../models/mysql/bicicletas');
const Prestamo = require('../models/mysql/prestamos');
const { httpError } = require('../utils/handleError');
const { Op, Sequelize } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await preoperacionalesModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_PREOPERACIONALES");
    }
};

const getItemTrip = async (req, res) => {
    try {
        req = matchedData(req)
        const { idViaje } = req
        const data = await preoperacionalesModels.findOne({
            where:  {idViaje: idViaje}
        });
        res.send(data);
    } catch (e) {
        httpError(res, "ERROR_GET_PREOPERACIONALES")
    }
};

const getItemsUser = async (req, res) => {
    try {
        req = matchedData(req)
        const { usuario } = req
        const data = await preoperacionalesModels.findAll({
            where:  {usuario: usuario}
        });
        res.send(data);
    } catch (e) {
        httpError(res, "ERROR_GET_PREOPERACIONALES_USER")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await preoperacionalesModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_PREOPERACIONALES")
    }

};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const id = req.params.id;
    try {
        const data = await preoperacionalesModels.update(
        objetoACambiar,
        {
            where: { id: id }
        })
        res.send('ok');
    } catch (error) {
        httpError(res, `ERROR_UPDATE_ESTADO_PREOPERACIONALES `);
    }
};
const getItemsWithPrestamos = async (req, res) => {
    try {
        const data = await preoperacionalesModels.findAll({
            include: [{
                model: Prestamo,
                as: 'prestamo',
                required: false,
                where: {
                    pre_id: Sequelize.col('bc_PREOPERACIONALES_trip.ind_viaje')
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
        httpError(res, "ERROR_GET_PREOPERACIONALES_WITH_PRESTAMOS");
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

        const data = await preoperacionalesModels.findAll({
            include: [{
                model: Prestamo,
                as: 'prestamo',
                required: false,
                where: {
                    pre_id: Sequelize.col('bc_preoperacionales.idViaje')
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
        httpError(res, "ERROR_GET_PREOPERACIONALES_WITH_PRESTAMOS_BY_EMPRESA");
    }
};

const getItemWithPrestamo = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const data = await preoperacionalesModels.findOne({
            where: { id },
            include: [{
                model: Prestamo,
                required: true,
                where: {
                    pre_id: Sequelize.col('idViaje')
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
const getPreoperacionalesByPrestamosIds = async (req, res) => {
    try {
        const { prestamosIds } = req.body;

        if (!prestamosIds || !Array.isArray(prestamosIds) || prestamosIds.length === 0) {
            return res.send({ data: [] });
        }

        const data = await preoperacionalesModels.findAll({
            where: {
                idViaje: {
                    [Op.in]: prestamosIds
                }
            },
            include: [{
                model: Prestamo, // Usar el modelo directo
                as: 'prestamo', // Usar el alias correcto
                required: false,
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        required: false,
                        attributes: ['usu_nombre', 'usu_documento']
                    },
                    {
                        model: Bicicleta,
                        as: 'bicicleta',
                        required: false,
                        attributes: ['bic_nombre', 'bic_numero']
                    }
                ]
            }]
        });

        res.send({ data: data || [] });
    } catch (error) {
        console.error('Error completo:', error);
        res.send({ data: [] });
    }
};

const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItemTrip, getItemsUser, createItem, deleteItem, patchItem, getItemsWithPrestamos,getItemWithPrestamo, getItemsWithPrestamosByEmpresa, getPreoperacionalesByPrestamosIds
}
