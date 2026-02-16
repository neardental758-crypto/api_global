const { matchedData } = require('express-validator');
const { RegistrosPPModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');
const Prestamos = require('../models/mysql/prestamos');
const Bicicleta = require('../models/mysql/bicicletas');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');


const getItems = async (req, res) => {RegistrosPPModels
    try {
        const data = await RegistrosPPModels.findAll({});
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_REGSITRO_PP");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { usuario } = req;

        // Buscar el registro por su clave primaria
        const data = await RegistrosPPModels.findByPk(usuario);

        // Verificar si el registro existe
        const response = data ? 1 : 0;
        res.send({ response, data });
    } catch (e) {
        console.error("Error:", e);
        httpError(res, "ERROR_GET_REGSITRO_PP");
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req;
        // Crear el registro en la base de datos
        const data = await RegistrosPPModels.create(body);
        // Enviar una respuesta de éxito
        res.send({ message: "ok", data: data });
    } catch (e) {
        console.error("Error al crear el registro:", e);
        httpError(res, "ERROR_CREATE_REGSITRO_PP");
    }
};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await RegistrosPPModels.update(
            {
                ultimo_vehiculo: body.ultimo_vehiculo,
            },
            {
                where: { usuario: body.usuario },
            }
        )
        res.status(200);
        res.send({ message: "ok" });
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_REGISTRO_PP");
    }
};

const getItemsByOrganization = async (req, res) => {
    try {
        const { organizationId } = req.params;
        
        const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
        const page = parseInt(filter.page) || 1;
        const limit = parseInt(filter.limit) || 20;
        const search = filter.search || '';
        const estacion = filter.estacion || '';
        const startDate = filter.startDate || '';
        const endDate = filter.endDate || '';
        
        const empresa = await Empresa.findOne({
            where: { emp_id: organizationId }
        });
        
        if (!empresa) {
            return res.send({ data: [], total: 0, currentPage: 1, totalPages: 0, allEstaciones: [] });
        }
        
        const empresaNombre = empresa.emp_nombre;
        
        const registrosBase = await RegistrosPPModels.findAll({
            attributes: [],
            include: [
                {
                    model: Bicicleta,
                    as: 'bicicleta',
                    attributes: [[sequelize.fn('DISTINCT', sequelize.col('bicicleta.bic_estacion')), 'bic_estacion']],
                    required: true
                },
                {
                    model: Usuario,
                    as: 'usuarioData',
                    attributes: [],
                    where: { 
                        usu_empresa: empresaNombre,
                        [Op.or]: [
                            { usu_prueba: 0 },
                            { usu_prueba: false },
                            { usu_prueba: null }
                        ]
                    },
                    required: true
                }
            ],
            raw: true
        });
        
        const allEstaciones = registrosBase
            .map(r => r['bicicleta.bic_estacion'])
            .filter(e => e != null)
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort();
        
        const offset = (page - 1) * limit;
        
        let whereClause = {};
        let bicicletaWhere = {};
        let usuarioWhere = {
            usu_empresa: empresaNombre,
            [Op.or]: [
                { usu_prueba: 0 },
                { usu_prueba: false },
                { usu_prueba: null }
            ]
        };
        
        if (search && search.trim()) {
            console.log('Aplicando búsqueda:', search);
            
            whereClause[Op.or] = [
                { '$usuarioData.usu_nombre$': { [Op.like]: `%${search}%` } },
                { '$usuarioData.usu_documento$': { [Op.like]: `%${search}%` } },
                { '$bicicleta.bic_numero$': { [Op.like]: `%${search}%` } }
            ];
        }
        
        if (estacion && estacion.trim()) {
            bicicletaWhere.bic_estacion = estacion;
        }

        if (startDate && endDate) {
            whereClause.fecha = {
                [Op.between]: [startDate + ' 00:00:00', endDate + ' 23:59:59']
            };
        }
        
        const bicicletaRequired = Object.keys(bicicletaWhere).length > 0;
        
        const { count, rows } = await RegistrosPPModels.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Prestamos,
                    as: 'prestamo',
                    attributes: ['pre_id', 'pre_retiro_fecha', 'pre_devolucion_fecha', 'pre_duracion', 'pre_retiro_estacion', 'pre_devolucion_estacion'],
                    required: false
                },
                {
                    model: Bicicleta,
                    as: 'bicicleta',
                    attributes: ['bic_id', 'bic_nombre', 'bic_numero', 'bic_estacion'],
                    where: Object.keys(bicicletaWhere).length > 0 ? bicicletaWhere : undefined,
                    required: bicicletaRequired
                },
                {
                    model: Usuario,
                    as: 'usuarioData',
                    attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_prueba'],
                    where: usuarioWhere,
                    required: true
                }
            ],
            order: [['fecha', 'DESC']],
            limit: limit,
            offset: offset,
            subQuery: false
        });
        
        const totalPages = Math.ceil(count / limit);
        
        res.send({ 
            data: rows, 
            total: count,
            currentPage: page,
            totalPages: totalPages,
            allEstaciones: allEstaciones
        });
    } catch (error) {
        console.error("Error completo:", error);
        httpError(res, "ERROR_GET_REGISTROS_PP_EMPRESA");
    }
};

const deleteItem = (req, res) => { };

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem, getItemsByOrganization
}
