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
        
        let bicicletasIds = [];
        
        if (estacion_id && estacion_id !== 'undefined') {
            let query = `SELECT bic_id FROM bc_bicicletas WHERE bic_estacion = :estacion_id`;
            const replacements = { estacion_id };
            
            if (bicicletaFiltro) {
                query += ` AND bic_numero LIKE :bicicletaFiltro`;
                replacements.bicicletaFiltro = `%${bicicletaFiltro}%`;
            }
            
            const bicicletas = await sequelize.query(query, {
                replacements,
                type: sequelize.QueryTypes.SELECT
            });
            
            bicicletasIds = bicicletas.map(b => b.bic_id);
            
        } else {
            const empresa = await sequelize.query(
                `SELECT emp_nombre FROM bc_empresas WHERE emp_id = :empresa_id`,
                {
                    replacements: { empresa_id },
                    type: sequelize.QueryTypes.SELECT
                }
            );
            
            if (empresa.length === 0) {
                return res.send({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
            }
            
            const empresaNombre = empresa[0].emp_nombre;
            
            const estaciones = await sequelize.query(
                `SELECT est_estacion FROM bc_estaciones WHERE est_empresa = :empresaNombre`,
                {
                    replacements: { empresaNombre },
                    type: sequelize.QueryTypes.SELECT
                }
            );
            
            const estacionesIds = estaciones.map(e => e.est_estacion);
            
            if (estacionesIds.length === 0) {
                return res.send({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
            }
            
            let query = `SELECT bic_id FROM bc_bicicletas WHERE bic_estacion IN (:estacionesIds)`;
            const replacements = { estacionesIds };
            
            if (bicicletaFiltro) {
                query += ` AND bic_numero LIKE :bicicletaFiltro`;
                replacements.bicicletaFiltro = `%${bicicletaFiltro}%`;
            }
            
            const bicicletas = await sequelize.query(query, {
                replacements,
                type: sequelize.QueryTypes.SELECT
            });
            
            bicicletasIds = bicicletas.map(b => b.bic_id);
        }
        
        if (bicicletasIds.length === 0) {
            return res.send({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
        }

        const { count, rows } = await comentariosModels.findAndCountAll({
            where: {},
            include: [
                {
                    model: Prestamos,
                    attributes: ['pre_id', 'pre_bicicleta', 'pre_retiro_fecha'],
                    where: { pre_bicicleta: { [Op.in]: bicicletasIds } },
                    required: true,
                    include: [{
                        model: Bicicleta,
                        attributes: ['bic_id', 'bic_numero', 'bic_estacion']
                    }]
                },
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
