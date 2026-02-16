const { matchedData } = require('express-validator');
const { progresoLogrosModels, usuarioModels, productosModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const Logros = require('../models/mysql/logros');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');
const progresoLogros = require('../models/mysql/progresoLogros');
const Estacion = require('../models/mysql/estacion');
const { sequelize } = require('../config/mysql');
const EmpresaLogro = require('../models/mysql/empresa_logro');


const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await progresoLogrosModels.findAll({});
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
        const data = await progresoLogrosModels.findAll({
            where: { "ultima_actualizacion": { [Op.between]: [startedDate, endDate] } },
        });
        res.send({ data });
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM `);
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await progresoLogrosModels.findByPk(id);
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_DESAFIO")
    }
};

const getItemUsuario = async (req, res) => {
  try {
    req = matchedData(req);
    const { usuario_id } = req;

    const data = await progresoLogrosModels.findAll({ 
      where: { usuario_id },
      include: [
        {
          model: Logros,
          as: 'logro', 
          attributes: ['id_logro', 'descripcion', 'estado'] // 👈 campos reales
        }
      ]
    });

    res.send({ data });
  } catch (e) {
    console.error(e);
    httpError(res, "ERROR_GET_PROGRESO_LOGROS");
  }
};

const getLogroProgreso = async (req, res) => {
    try {
        const body = matchedData(req);
        const data = await progresoLogrosModels.findAll({
            where: {
                usuario_id: body.usuario_id,
                logro_id: body.logro_id,
                estado: body.estado,
            },
            include: [
                {
                    model: EmpresaLogro,
                    as: 'logro', // alias debe coincidir con el definido en la asociación
                    attributes: ['meta', 'tipo'] // lo que necesitas
                }
            ]
        });
        res.send({ data });
    } catch (e) {
        console.error(e);
        httpError(res, "ERROR_GET_PROGRESO_LOGROS_USER");
    }
};


const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await progresoLogrosModels.create(body)
        console.log("Request Body:", req.body);
        res.send('ok')
    } catch (error) {
        console.error('Error creating progreso logro:', error); // Agrega más detalles al log
        httpError(res, "ERROR_CREATE_PROGRESO_LOGRO");
    }

};

const patchLogroProgreso = async (req, res) => {
    try {
        const data = matchedData(req, { locations: ['params', 'body'] });
        console.log('Data to update:', data);

        const updated = await progresoLogrosModels.update(
            {
                estado: "RECLAMADO",
            },
            {
                where: {
                    usuario_id: data.usuario_id,
                    logro_id: data.logro_id,
                },
            }
        );

        if (updated[0] === 0) {
            return res.status(404).json({ error: 'No se encontró ningún registro para actualizar' });
        }

        res.send({ updated });
    } catch (e) {
        console.error('Error al actualizar:', e);
        httpError(res, "ERROR_PATCH_PROGRESO_LOGROS_COMPLETADO");
    }
};



const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await progresoLogrosModels.update(
            {
                progreso: body.progreso,
            },
            {
                where: { usuario_id : body.usuario_id , logro_id : body.logro_id , id: body.id},
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_PROGRESO_LOGRO");
    }
};
const updateItemState = async (req, res) => {
    try {
        const { body } = req
        const data = await progresoLogrosModels.update(
            {
                estado: body.estado,
            },
            {
                where: { usuario_id : body.usuario_id , logro_id : body.logro_id, id : body.id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_PROGRESO_LOGRO");
    }
};
const getItemByState = async (req, res) => {
    try {
        req = matchedData(req);
        
        const data = await progresoLogrosModels.findAll({
            where: { estado: 'ACTIVO' },
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_PROGRESO_LOGROS");
    }
};


const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const id = req.params.id;
    const usuario_id = req.params.usuario_id;
    console.log('Objeto a cambiar en API',objetoACambiar);
    console.log('id en API',id);
    console.log('usuaio id API',usuario_id);
    try {
        const data = await progresoLogrosModels.update(
            objetoACambiar,
            {
                where: { id: id }
            })
        res.send('ok');
    } catch (error) {
        httpError(res, `ERROR_UPDATE_ESTADO_DESAFIO `);
    }
};
const getItemsByEmpresa = async (req, res) => {
    try {
        req = matchedData(req);
        const { empresa } = req;
        
        const data = await progresoLogrosModels.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'bc_usuario',
                    where: {
                        usu_empresa: empresa
                    },
                    attributes: ['usu_documento', 'usu_nombre', 'usu_dir_trabajo']
                },
                {
                    model: Logros,
                    as: 'logro',
                    attributes: ['id_logro', 'descripcion', 'estado']
                }
            ]
        });
        
        const estaciones = await Estacion.findAll({
            attributes: ['est_estacion', 'est_direccion']
        });
        
        const logrosIds = [...new Set(data.map(item => item.logro_id))];
        
        const empresaLogros = await EmpresaLogro.findAll({
            where: {
                idEmpresa: empresa,
                idLogro: logrosIds
            },
            attributes: ['idLogro', 'meta']
        });
        
        const formattedData = data.map(item => {
            const estacion = estaciones.find(est => 
                est.est_direccion === item.bc_usuario.usu_dir_trabajo
            );
            
            const empresaLogro = empresaLogros.find(el => 
                el.idLogro === item.logro_id
            );
            
            return {
                id: item.id,
                usuario_id: item.usuario_id,
                usuario_nombre: item.bc_usuario.usu_nombre,
                documento: item.bc_usuario.usu_documento,
                estacion_nombre: estacion ? estacion.est_estacion : 'Sin estación',
                logro_id: item.logro_id,
                logro_descripcion: item.logro.descripcion,
                progreso: item.progreso,
                meta: empresaLogro ? empresaLogro.meta : 'Sin meta establecida',
                estado: item.estado,
                ultima_actualizacion: item.ultima_actualizacion
            };
        });
        
        res.send({ data: formattedData });
    } catch (e) {
        console.error(e);
        httpError(res, "ERROR_GET_PROGRESO_LOGROS_EMPRESA");
    }
};

const deleteItem = (req, res) => { };

module.exports = {
    getItems, getItem, createItem,  deleteItem, getItemsToDate, patchItem, getLogroProgreso, getItemByState, updateItem, updateItemState, getItemUsuario, patchLogroProgreso, getItemsByEmpresa
}
