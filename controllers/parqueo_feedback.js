const { matchedData } = require('express-validator');
const { feedbackParqueoModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');
const lugar_parqueo = require('../models/mysql/parqueo_lugar');
const Renta_parqueo = require('../models/mysql/parqueo_renta');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await feedbackParqueoModels.findAll({
            include:[{
                model: Renta_parqueo,
                attributes: ['id'],
                include:[{
                    model: lugar_parqueo,
                    attributes: ['numero']
                  }]
              },
              {
                model: Usuario,
                attributes: [ 'usu_documento', 'usu_empresa' ],
                include:[{
                    model: Empresa,
                    attributes: ['id']
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
    const data = await feedbackParqueoModels.findAll({
        where : {
            "com_fecha" : {[Op.between] : [startedDate , endDate ]},
            },
        include:[{
            model: Renta_parqueo,
            attributes: ['id'],
            include:[{
                model: lugar_parqueo,
                attributes: ['numero']
              }]
          },
          {
            model: Usuario,
            attributes: [ 'usu_documento', 'usu_empresa' , 'usu_nombre'],
            include:[{
                model: Empresa,
                attributes: ['id'],
                where: {
                    id: organization
                }
             }]
         }],
         order: [
            ['fecha', 'DESC']
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
    httpError(res, `ERROR_GET_COMMENTS_PARQUEO`);
}
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await feedbackParqueoModels.findByPk(id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMENTARIO_PARQUEO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await feedbackParqueoModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_COMENTARIO_PARQUEO")
    }

};

const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem, getItemsToDate
}
