const { matchedData } = require('express-validator');
const { vpusuarioModels , usuarioModels, empresaModels} = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require("sequelize");

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await vpusuarioModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_RESERVAS");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {vus_id} = req
        const data = await vpusuarioModels.findByPk(vus_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_USER")
    }
};

const getItemUsuario = async (req, res) => {
    try {
        req = matchedData(req)
        const { vus_usuario } = req
        const data = await vpusuarioModels.findAll({ where: { vus_usuario: vus_usuario, vus_estado: 'ACTIVA' }});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_RESERVAS_USUARIO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await vpusuarioModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_VP_USUARIO")
    }

};


const getIValidateVehiculo = async (req, res) => {
    try {
        req = matchedData(req)
        const { vus_id, vus_usuario } = req
        const data = await vpusuarioModels.findAll({
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
        const data = await vpusuarioModels.findAll({ where: { vus_id: { [Op.like]: `%${body.vus_id}` } ,vus_usuario: body.vus_usuario }});
        console.log('LA DATA DESDE EL API::::',data);
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_VALIDATE_VEHICULO_USUARIO");
    }
};*/

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await vpusuarioModels.update(
            {
                res_estado: body.estado,
            },
            {
                where: { res_id : body.res_id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_RESERVA");
    }
};

const updateItemVehiculo = async (req, res) => {
    try {
        const { body } = req
        const data = await vpusuarioModels.update(
            {
                res_bicicleta : body.res_bicicleta,
            },
            {
                where: { res_id : body.res_id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_VEHICULO_RESERVA");
    }
};

const getVehiculosUsuario = async (req, res) => {
    try {
        const data = await vpusuarioModels.findAll({
            include: [
                {
                    model: usuarioModels,
                    as: 'usuario',
                    attributes: ['usu_nombre']
                }
            ],
            attributes: [
                'vus_id',
                'vus_usuario', 
                'vus_tipo',
                'vus_marca',
                'vus_modelo',
                'vus_cilindraje',
                'vus_color',
                'vus_serial',
                'vus_fecha_registro',
                'vus_img',
                'vus_estado'
            ]
        });

        const vehiculosConNombre = data.map(vehiculo => ({
            ...vehiculo.dataValues,
            nombre_usuario: vehiculo.usuario ? vehiculo.usuario.usu_nombre : 'Usuario no encontrado'
        }));

        res.send({ data: vehiculosConNombre });
    } catch (error) {
        console.error('Error al obtener vehículos de usuario:', error);
        httpError(res, "ERROR_GET_VEHICULOS_USUARIO");
    }
};
const getVehiculosPorEmpresa = async (req, res) => {
    try {
        req = matchedData(req);
        
        const { empresaId } = req;

        const empresa = await empresaModels.findOne({
            where: { emp_id: empresaId }
        });
        
        if (!empresa) {
            return httpError(res, "EMPRESA_NO_ENCONTRADA");
        }

        const data = await vpusuarioModels.findAll({
            include: [
                {
                    model: usuarioModels,
                    as: 'usuario',
                    attributes: ['usu_nombre'],
                    where: { usu_empresa: empresa.emp_nombre },
                    required: true
                }
            ],
            attributes: [
                'vus_id',
                'vus_usuario', 
                'vus_tipo',
                'vus_marca',
                'vus_modelo',
                'vus_cilindraje',
                'vus_color',
                'vus_serial',
                'vus_fecha_registro',
                'vus_img',
                'vus_estado'
            ]
        });

        const vehiculosConNombre = data.map(vehiculo => ({
            ...vehiculo.dataValues,
            nombre_usuario: vehiculo.usuario ? vehiculo.usuario.usu_nombre : 'Usuario no encontrado'
        }));

        res.send({ data: vehiculosConNombre });
    } catch (error) {
        console.error('❌ Error en getVehiculosPorEmpresa:', error);
        httpError(res, "ERROR_GET_VEHICULOS_POR_EMPRESA");
    }
};

const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, getItemUsuario, createItem, updateItem, deleteItem, updateItemVehiculo, getIValidateVehiculo, getVehiculosUsuario, getVehiculosPorEmpresa
}
