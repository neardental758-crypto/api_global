const { matchedData } = require('express-validator');
const { vpviajesModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require("sequelize");
const Usuario = require('../models/mysql/usuario');
const Comentario = require('../models/mysql/vpcomentarios');
const Vehiculo = require('../models/mysql/vpusuario');
const Empresa = require('../models/mysql/empresa');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await vpviajesModels.findAll({
            include:[
            {
                model: Usuario,
                as: 'usuario',
                attributes: ['usu_documento', 'usu_nombre', 'usu_empresa'],
                include:[{
                    model: Empresa,
                    attributes: ['emp_id'],
                  }],
            },
            {
                model: Comentario,
                as: 'comentarios'
            },
            {
                model: Vehiculo,
                as: 'vehiculo'
            }]
        });
        res.send({data});
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM_VIAJES_VP`);
    }
};

const getItemsFilter = async (req, res) => {
    const filtro = JSON.parse(req.query.filter);
    const organization = filtro.organizationId;
    try {
        //findAll para sequelize y find para mongoose
        const data = await vpviajesModels.findAll({
            include:[
            {
                model: Usuario,
                as: 'usuario',
                attributes: ['usu_documento', 'usu_nombre', 'usu_empresa'],
                include:[{
                    model: Empresa,
                    attributes: ['emp_id'],
                    where : {
                        emp_id : organization
                    }
                  }],
                  required: true
            },
            {
                model: Comentario,
                as: 'comentarios'
            },
            {
                model: Vehiculo,
                as: 'vehiculo'
            }]
        });
        res.send({data});
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM_VIAJES_VP`);
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {via_usuario} = req
        const data = await vpviajesModels.findAll({ 
            include:[
                {
                    model: Vehiculo,
                    as: 'vehiculo'
                }
            ],
            where: { via_usuario: via_usuario }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_USER_VP");
    }
};

const getItemUsuario = async (req, res) => {
    try {
        req = matchedData(req)
        const { via_usuario } = req
        const data = await vpviajesModels.findAll({ where: { via_usuario: via_usuario, via_estado: 'ACTIVA' }});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_VIAJES_USUARIO_VP")
    }
};

const getItemViajeActivo = async (req, res) => {
    try {
        req = matchedData(req)
        const { via_usuario } = req
        const data = await vpviajesModels.findAll({
            where:  {
                        via_usuario: via_usuario,
                        via_estado: 'ACTIVA'
                    }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_VIAJES_ACTIVES_USUARIO_VP")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        console.log('el bodddy: ', body)
        const data = await vpviajesModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_VIAJE_USUARIO_VP")
    }

};


const getIValidateVehiculo = async (req, res) => {
    try {
        req = matchedData(req)
        const { vus_id, vus_usuario } = req
        const data = await vpviajesModels.findAll({
            where: { vus_id: { [Op.like]: `%${vus_id}` }, vus_usuario: vus_usuario }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_VALIDATE_COD_USU")
    }
};

/*const getIValidateVehiculo = async (req, res) => {
    try {
        const { body } = req
        const data = await vpviajesModels.findAll({ where: { vus_id: { [Op.like]: `%${body.vus_id}` } ,vus_usuario: body.vus_usuario }});
        console.log('LA DATA DESDE EL API::::',data);
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_VALIDATE_VEHICULO_USUARIO");
    }
};*/

const updateItemState = async (req, res) => {
    try {
        const { body } = req
        const data = await vpviajesModels.update(
            {
                via_estado : body.via_estado,
            },
            {
                where: { via_id : body.via_id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_VIAJE_VP");
    }
};

const updateItemTrip = async (req, res) => {
    try {
        const { body } = req
        const data = await vpviajesModels.update(
            {
                via_fecha_creacion: body.via_fecha_creacion,
                via_duracion: body.via_duracion,
                via_kilometros: body.via_kilometros,
                via_estado : body.via_estado
            },
            {
                where: { via_id : body.via_id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ITEM_VIAJE_VP");
    }
};

const deleteItem = (req, res) => {};

module.exports = {
    getItems,
    getItem,
    getItemUsuario,
    createItem,
    updateItemState,
    updateItemTrip,
    deleteItem,
    getIValidateVehiculo,
    getItemViajeActivo, 
    getItemsFilter
}
