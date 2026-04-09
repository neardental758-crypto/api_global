const { matchedData } = require('express-validator');
const { comentariosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');
const Estacion = require('../models/mysql/empresa');

const Bicicleta = require('../models/mysql/bicicletas');
const Prestamos = require('../models/mysql/prestamos');
const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await comentariosModels.findAll({
            include:[{
                model: Prestamos,
                attributes: ['pre_id'],
                include:[{
                    model: Bicicleta,
                    attributes: ['bic_numero']
                  }]
              },
              {
                model: Usuario,
                attributes: [ 'usu_documento', 'usu_empresa' ],
                include:[{
                    model: Empresa,
                    attributes: ['emp_id']
                 }]
             }],
             order: [
                ['com_fecha', 'DESC']
            ]
        });
        res.send({data});
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM_COMENTARIOS`);
    }
};
const getItemsToDate = async (req, res) => {
    try {
    const filtro = JSON.parse(req.query.filter);
    const startedDate = new Date(filtro.startDate);
    const endDate = new Date(filtro.endDate);
    const organization = filtro.organization;
    const data = await comentariosModels.findAll({
        where : {
            "com_fecha" : {[Op.between] : [startedDate , endDate ]},
            },
        include:[{
            model: Prestamos,
            attributes: ['pre_id'],
            include:[{
                model: Bicicleta,
                attributes: ['bic_numero']
              }]
          },
          {
            model: Usuario,
            attributes: [ 'usu_documento', 'usu_empresa' , 'usu_nombre'],
            include:[{
                model: Empresa,
                attributes: ['emp_id'],
                where: {
                    emp_id: organization
                }
             }]
         }],
         order: [
            ['com_fecha', 'DESC']
        ]
    });
    const filterData = data.filter(dato =>{
        return dato.bc_usuario != null;
    })
    if(filterData.length > 0){
        res.send({data:filterData});
    }else{
        res.send({data:[]});
    }
} catch (error) {
    httpError(res, `ERROR_GET_COMMENTS`);
}
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {com_id} = req
        const data = await comentariosModels.findByPk(com_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMENTARIO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await comentariosModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_COMENTARIO")
    }

};
const getComentariosPorEmpresaEstacion = async (req, res) => {
    try {
        const { empresa_id, estacion_id } = req.params;
        
        let page = 1;
        let limit = 10;
        let bicicletaFiltro = null;
        
        if (req.query.filter) {
            const filter = JSON.parse(req.query.filter);
            page = parseInt(filter.page) || 1;
            limit = parseInt(filter.limit) || 10;
            bicicletaFiltro = filter.bicicleta || null;
        }
        
        const offset = (page - 1) * limit;

        const includePrestamo = {
            model: Prestamos,
            attributes: ['pre_id', 'pre_bicicleta', 'pre_retiro_fecha'],
            required: true,
            include: [
                {
                    model: Bicicleta,
                    attributes: ['bic_id', 'bic_numero', 'bic_estacion'],
                    required: true,
                    where: {}
                }
            ]
        };

        // Filtro por número de bicicleta (texto)
        if (bicicletaFiltro) {
            includePrestamo.include[0].where.bic_numero = { [Op.like]: `%${bicicletaFiltro}%` };
        }

        // Filtro por estación o por empresa (sin construir IN gigante de IDs)
        if (estacion_id && estacion_id !== 'undefined') {
            includePrestamo.include[0].where.bic_estacion = estacion_id;
        } else {
            const empresa = await sequelize.query(
                `SELECT emp_nombre FROM bc_empresas WHERE emp_id = :empresa_id`,
                {
                    replacements: { empresa_id },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (!empresa || empresa.length === 0) {
                return res.send({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
            }

            const empresaNombre = empresa[0].emp_nombre;

            // Subquery: estaciones de la empresa
            // (evita traer la lista completa a Node y evita IN enorme en el log)
            includePrestamo.include[0].where.bic_estacion = {
                [Op.in]: sequelize.literal(
                    `(SELECT est_estacion FROM bc_estaciones WHERE est_empresa = ${sequelize.escape(empresaNombre)})`
                )
            };
        }

        const { count, rows } = await comentariosModels.findAndCountAll({
            where: {},
            include: [
                includePrestamo,
                {
                    model: Usuario,
                    attributes: ['usu_documento', 'usu_nombre']
                }
            ],
            order: [['com_fecha', 'DESC']],
            limit,
            offset,
            distinct: true
        });
        
        res.send({ 
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('ERROR en getComentariosPorEmpresaEstacion:', error);
        httpError(res, "ERROR_GET_COMENTARIOS_EMPRESA_ESTACION");
    }
};

const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem, getItemsToDate,getComentariosPorEmpresaEstacion
}
