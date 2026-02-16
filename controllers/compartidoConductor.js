const { matchedData } = require('express-validator');
const { Op } = require('sequelize');
const { compartidoConductorModels } = require('../models');
const { compartidoViajeActivoModels } = require('../models');
const { compartidoSolicitudModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Usuario = require('../models/mysql/usuario');
const ViajeActivo = require('../models/mysql/compartidoViajeActivo');
const Empresa = require('../models/mysql/empresa');
const Solicitud = require('../models/mysql/compartidoSolicitud');
const Vehiculo = require('../models/mysql/compartidoVehiculos');
const CompartidoComentarios = require('../models/mysql/compartidoComentarios');

const getItems = async (req, res) => {
    try {
        const data = await compartidoConductorModels.findAll({
            include : [{
                model : Usuario,
                as : "conductor",
                attributes : ['usu_documento', 'usu_nombre'],
            },
            {   model : ViajeActivo,
                as : "viajeActivoConductor",
                attributes :["lSalida", "llegada", "fecha", "estado"],
                where : {
                    estado : 'ACTIVA'
                }
            }],
        });
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOCONDUCTOR");
    }
};

const getItemsFilterOrganization = async (req, res) => {
    req = matchedData(req)
    const { organizationId } = req
    try {
        const data = await compartidoConductorModels.findAll({
            include : [{
                model : Usuario,
                as : "conductor",
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
            {   model : ViajeActivo,
                as : "viajeActivoConductor",
                attributes :["lSalida", "llegada", "fecha", "estado"],
                order: [
                    ['fecha', 'DESC']
                ],
                limit: 1,
                required: true
            }
        ],
        });
        const result = data.map(item => ({
            ...item.toJSON(),
            viajeActivoConductor: item.viajeActivoConductor && item.viajeActivoConductor.length > 0
                ? item.viajeActivoConductor[0]
                : { 
                    "lSalida": "No ha viajado",
                    "llegada": "No ha viajado", 
                    "fecha": new Date().toISOString(),
                    "estado": "INACTIVO"
                }
        }));
        res.send({ data: result });
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM_COMPARTIDOCONDUCTOR`);
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {_id} = req
        const data = await compartidoConductorModels.findByPk(_id, {
            include: [{   
                model : ViajeActivo,
                as : "viajeActivoConductor",
            }]
        });        
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_COMPARTIDOCONDUCTOR ${e}`)
    }
};


const getItinerario = async (req, res) => {
    try {
        const { _id } = req.params; 
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const midnightDate = currentDate.toISOString();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        // Obtener los viajes activos de los conductores
        const dataDriver = await compartidoViajeActivoModels.findAll({
            where: {
                conductor: _id,
                estado: 'ACTIVA',
                fecha: {
                    [Op.gte]: midnightDate
                }
            },
            include: [{
                model: Solicitud,
                as: 'viajeSolicitado',
            }, 
            {
                model: Vehiculo,
            }
        ],
        });
        // Obtener las solicitudes activas de los riders
        const dataRider = await compartidoSolicitudModels.findAll({
            where: {
                idSolicitante: _id, 
                estadoSolicitud: {
                    [Op.or]: ['ACTIVO', 'APROBADA', 'PENDIENTE']
                }
            },
            include: [{
                model: ViajeActivo,
                as: "viajeSolicitado",
                attributes: ['lSalida', 'llegada', 'fecha', 'estado', 'coorSalida', 'coorDestino', 'precio', 'distanciaGoogle'],
                where: {
                    fecha: {
                        [Op.gte]: midnightDate
                    },
                    estado: {
                        [Op.or]: ['ACTIVA', 'PROCESO']
                    }
                },
                include: [{
                    model: Usuario,
                    attributes: ['usu_documento', 'usu_nombre', 'usu_img', 'usu_calificacion'],
                }, {
                    model: Vehiculo,
                }]
            }],
            required: true
        });
        // Fusionar los datos de conductores y solicitantes en un solo array
        const combinedData = [
            ...dataDriver.map(item => ({
                tipo: 'driver', // Identificar si es conductor
                fecha: item.fecha ? item.fecha : null,
                data: item
            })),
            ...dataRider.map(item => ({
                tipo: 'rider', // Identificar si es solicitante
                fecha: item.viajeSolicitado ? item.viajeSolicitado.fecha : null,
                data: item
            }))
        ];
        // Ordenar los datos por fecha de viaje (de forma ascendente)
        const sortedData = combinedData.sort((a, b) => {
            const dateA = a.fecha ? new Date(a.fecha).getTime() : Infinity;  // Si no hay fecha, se coloca al final
            const dateB = b.fecha ? new Date(b.fecha).getTime() : Infinity;  // Lo mismo para el otro item
            return dateA - dateB;
        });
        // Paginación
        const totalItems = sortedData.length;
        const paginatedData = sortedData.slice(offset, offset + limit);
        const totalPages = Math.ceil(totalItems / limit);
        // Enviar la respuesta con los datos y la paginación
        res.send({
            data: paginatedData,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
            },
        });
    } catch (e) {
        // Manejo de errores
        httpError(res, `ERROR_GET_COMPARTIDOCONDUCTOR ${e}`);
    }
};


const getHistorial = async (req, res) => {
    try {
        const { _id } = req.params;
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const midnightDate = currentDate.toISOString();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const dataDriver = await compartidoViajeActivoModels.findAll({    
            where: {
                conductor: _id,
                estado: {
                    [Op.or]: ['FINALIZADA', 'CANCELADA']
                }
            },
            include: [{
                model: Solicitud,
                as: 'viajeSolicitado',
            }, {
                model: Vehiculo,
            }],
        }); 
        const dataRider = await compartidoSolicitudModels.findAll({
            where: {
                idSolicitante: _id,  // Filtrar por el solicitante
                estadoSolicitud: {
                    [Op.or]: ['FINALIZADA', 'APROBADA', 'PENDIENTE']
                }
            },
            include: [{
                model: ViajeActivo,
                as: "viajeSolicitado",
                attributes: ['lSalida', 'llegada', 'fecha', 'estado', 'coorSalida', 'coorDestino', 'precio', 'distanciaGoogle'],
                include:[{
                    model: Usuario,
                    attributes: ['usu_documento', 'usu_nombre', 'usu_img', 'usu_calificacion'],
                 },
                 {
                    model: Vehiculo,
                 }]
            }],
            required: true  // Asegura que los resultados de compartidoSolicitudModels tengan un viaje relacionado
        });     
       // Fusionar los resultados de driver y rider en un solo array
       const combinedData = [
        ...dataDriver.map(item => ({
            tipo: 'driver', // Identificar si es conductor
            fecha: item.fecha ? item.fecha : null,
            data: item
        })),
        ...dataRider.map(item => ({
            tipo: 'rider', // Identificar si es solicitante
            fecha: item.viajeSolicitado ? item.viajeSolicitado.fecha : null,
            data: item
        }))
    ];
    const sortedData = combinedData.sort((a, b) => {
        const dateA = a.fecha ? new Date(a.fecha).toISOString() : null;
        const dateB = b.fecha ? new Date(b.fecha).toISOString() : null;
        return new Date(dateB) - new Date(dateA);
    });
    const totalItems = sortedData.length;
    const paginatedData = sortedData.slice(offset, offset + limit);
    const totalPages = Math.ceil(totalItems / limit);
    res.send({
        data: paginatedData,
        pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
        },
    });
    } catch (e) {
        httpError(res, `ERROR_GET_COMPARTIDOCONDUCTOR ${e}`)
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        console.log('body en api conductor', body)
        const data = await compartidoConductorModels.create(body)
        res.send('Item Create Complete')
    } catch (error) {
        httpError(res, "ERROR_CREATE_COMPARTIDOCONDUCTOR")
    }

};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoConductorModels.update(
            {
                //data a cambiar
                nombre : body.nombre,
                cantidadViajes : (body.cantidadViajes)+1
            },
            {
                //Identificador
                where: { _id : body._id },
            }
        )
        res.send('Item Update Complete');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_COMPARTIDOCONDUCTOR");
    }
};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const _id = req.params._id;
    try {
        const data = await compartidoConductorModels.update(
        objetoACambiar,
        {
            where: { _id: _id }
        })
        let actual = await compartidoConductorModels.findByPk(_id);
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update compartidoConductor"
            });
        }else{
            res.json({
                message: "Update compartidoConductor failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOCONDUCTOR `);
    }
};

const deleteItem = async (req, res) => {
    try {
        const {_id} = req.params
        const data = await compartidoConductorModels.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_COMPARTIDOCONDUCTOR")
    }
};

const getCoductoresByOrganization = async (req, res) => {
    req = matchedData(req)
    const { organizationId } = req
    try {
        const data = await compartidoConductorModels.findAll({
            include : [{
                model : Usuario,
                as : "conductor",
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
                model : ViajeActivo,
                as : "viajeActivoConductor",
                attributes :["lSalida", "llegada", "fecha", "estado"],
                order: [
                    ['fecha', 'DESC']
                ],
                limit: 1,
                required: true
            },
            {
                model : Vehiculo,
                attributes: ['tipo', 'marca', 'modelo', 'color', 'placa'],
                required: false
            }
        ],
        });

        const result = await Promise.all(data.map(async item => {
            const itemJson = item.toJSON();
            
            const viajesFinalizados = await ViajeActivo.count({
                where: {
                    conductor: itemJson._id,
                    estado: 'FINALIZADA'
                }
            });

            if (viajesFinalizados === 0 || 
                (itemJson.viajeActivoConductor && itemJson.viajeActivoConductor.length > 0 && 
                 itemJson.viajeActivoConductor[0].lSalida === "No ha viajado")) {
                return null;
            }

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
                numeroViajes: viajesFinalizados,
                promedioCalificacion: promedioCalificacion,
                totalCalificaciones: calificaciones.length,
                viajeActivoConductor: itemJson.viajeActivoConductor && itemJson.viajeActivoConductor.length > 0
                    ? itemJson.viajeActivoConductor[0]
                    : null
            };
        }));

        const filteredResult = result.filter(item => item !== null);
        
        res.send({ data: filteredResult });
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM_COMPARTIDOCONDUCTOR ${error}`);
    }
};

module.exports = {
    getItems, getItem, createItem, updateItem, patchItem, deleteItem, getItemsFilterOrganization, getItinerario, getHistorial,getCoductoresByOrganization
}
