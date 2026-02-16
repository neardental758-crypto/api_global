const { matchedData } = require('express-validator');
const { compartidoPasajeroModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Usuario = require('../models/mysql/usuario');
const Solicitud = require('../models/mysql/compartidoSolicitud');
const ViajeActivo = require('../models/mysql/compartidoViajeActivo');
const Empresa = require('../models/mysql/empresa');
const { Op } = require('sequelize');
const CompartidoComentarios = require('../models/mysql/compartidoComentarios');

const getItems = async (req, res) => {
    try {
        const data = await compartidoPasajeroModels.findAll({
            include : [{
                model : Usuario,
                as : "pasajero",
                attributes : ['usu_documento', 'usu_nombre'],
            },
            {
                model : Solicitud,
                as : "viajeActivoPasajero",
                where : {
                    estadoSolicitud : 'APROBADA'
                },
                required : false,
                include : [{
                    model : ViajeActivo,
                    as : "viajeSolicitado",
                    attributes : ['estado'],
                    where : {
                        estado: {
                            [Op.ne]: 'FINALIZADA'
                        }
                    },
                    required : false,
                }],
            }
        ],
        });
        res.send({data});
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM_COMPARTIDOPASAJERO ${error}`);
    }
};
const getItemsFilterOrganization = async (req, res) => {
    req = matchedData(req)
    const { organizationId } = req
    try {
        const data = await compartidoPasajeroModels.findAll({
            include : [{
                model : Usuario,
                as : "pasajero",
                attributes : ['usu_documento', 'usu_nombre'],
                include:[{
                    model: Empresa,
                    attributes: ['emp_id'],
                    where : {
                        emp_id : organizationId
                    }
                  }],
                  required: true
            },
            {
                model : Solicitud,
                as : "viajeActivoPasajero",
                where : {
                    estadoSolicitud : 'APROBADA'
                },
                required : false,
                include : [{
                    model : ViajeActivo,
                    as : "viajeSolicitado",
                    attributes : ["lSalida", "llegada", "fecha", "estado"],
                }],
                required : false,
            }
        ],
        });
        const result = data.map(item => ({
            ...item.toJSON(),
            viajeActivoPasajero: item.viajeActivoPasajero && item.viajeActivoPasajero.length > 0
                ? item.viajeActivoPasajero[0]
                : { 
                    viajeSolicitado: {
                        lSalida: "No ha viajado",
                        llegada: "No ha viajado", 
                        fecha: new Date().toISOString(),
                        estado: "INACTIVO"
                    }
                }
        }));
        res.send({ data: result });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOPASAJERO");
    }
};
const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {_id} = req
        const data = await compartidoPasajeroModels.findByPk(_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMPARTIDOPASAJERO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoPasajeroModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_COMPARTIDOPASAJERO")
    }

};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoPasajeroModels.update(
            {
                //data a cambiar

            },
            {
                //Identificador
                where: { _id : body._id },
            }
        )
        res.send('Item Update Complete');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_COMPARTIDOPASAJERO");
    }
};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const _id = req.params._id;
    try {
        const data = await compartidoPasajeroModels.update(
        objetoACambiar,
        {
            where: { _id: _id }
        })
        let actual = await compartidoPasajeroModels.findByPk(_id);
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update compartidoPasajero"
            });
        }else{
            res.json({
                message: "Update compartidoPasajero failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOPASAJERO`);
    }
};

const deleteItem = async (req, res) => {
    try {
        const {_id} = req.params
        const data = await compartidoPasajeroModels.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_COMPARTIDOPASAJERO")
    }
};

const getPasajerosByOrganization = async (req, res) => {
  req = matchedData(req)
    const { organizationId } = req
    try {
        const data = await compartidoPasajeroModels.findAll({
            attributes: ['_id', 'fechaInscripcion', 'viajes'],
            include : [{
                model : Usuario,
                as : "pasajero",
                attributes : ['usu_documento', 'usu_nombre', 'usu_creacion'],
                include:[{
                    model: Empresa,
                    attributes: ['emp_id'],
                    where : {
                        emp_id : organizationId
                    }
                  }],
                  required: true
            },
            {
                model : Solicitud,
                as : "viajeActivoPasajero",
                where : {
                    estadoSolicitud : 'APROBADA'
                },
                required : false,
                include : [{
                    model : ViajeActivo,
                    as : "viajeSolicitado",
                    attributes : ["lSalida", "llegada", "fecha", "estado"],
                }],
                order: [
                    ['fechaSolicitud', 'DESC']
                ],
                limit: 1
            }
        ],
        });

        const result = await Promise.all(data.map(async item => {
            const itemJson = item.toJSON();

            const calificaciones = await CompartidoComentarios.findAll({
                attributes: ['calificacion'],
                where: {
                    idRecibido: itemJson._id,
                    calificacion: {
                        [Op.ne]: null,
                        [Op.ne]: ''
                    }
                }
            });

            let promedioCalificacion = 0;
            if (calificaciones.length > 0) {
                const sumaCalificaciones = calificaciones.reduce((sum, cal) => {
                    const calificacionNumero = parseFloat(cal.calificacion);
                    return sum + (isNaN(calificacionNumero) ? 0 : calificacionNumero);
                }, 0);
                promedioCalificacion = (sumaCalificaciones / calificaciones.length).toFixed(1);
            }

            return {
                ...itemJson,
                promedioCalificacion: promedioCalificacion,
                viajeActivoPasajero: itemJson.viajeActivoPasajero && itemJson.viajeActivoPasajero.length > 0
                    ? itemJson.viajeActivoPasajero[0]
                    : {
                        viajeSolicitado: {
                            lSalida: "No ha viajado",
                            llegada: "No ha viajado", 
                            fecha: new Date().toISOString(),
                            estado: "INACTIVO"
                        }
                    }
            };
        }));

        res.send({ data: result });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOPASAJERO");
    }
};


module.exports = {
    getItems, getItem, createItem, updateItem, patchItem, deleteItem, getItemsFilterOrganization, getPasajerosByOrganization
}
