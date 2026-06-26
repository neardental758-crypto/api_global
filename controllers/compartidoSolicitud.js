const { matchedData } = require('express-validator');
const { compartidoSolicitudModels, tokenMsnModels } = require('../models');
const { httpError } = require('../utils/handleError');
const CompartidoViajeActivo = require('../models/mysql/compartidoViajeActivo');
const CompartidoPagos = require('../models/mysql/compartidosPagos');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');
const Pasajero = require('../models/mysql/compartidoPasajero');
const Vehiculo = require('../models/mysql/compartidoVehiculos');
const { Op } = require('sequelize');
const socketIoService = require('../services/socketIoService');
const admin = require('../config/firebase');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await compartidoSolicitudModels.findAll({
            include:[{
                model: CompartidoViajeActivo,
                as : "viajeSolicitado",
                include:[{
                    model: Usuario,
                    attributes: ['usu_documento', 'usu_nombre', 'usu_img', 'usu_calificacion'],
                 }]
             }]
        });
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOSOLICITUD");
    }
};

const getItemsFilterOrganization = async (req, res) => {
    req = matchedData(req)
    const { organizationId } = req
    try {
        const data = await compartidoSolicitudModels.findAll({
            include : [{   
                model : CompartidoViajeActivo,
                as : "viajeSolicitado",
                attributes :["lSalida", "llegada", "fecha"],    
                include : [{
                    model : Usuario,
                    attributes : ['usu_documento', 'usu_nombre'],
                }],
                where : {
                    idOrganizacion : organizationId
                }       
            }],
            required: true
        });
        res.send({data});
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM_COMPARTIDOSOLICITUD ${error}`);
    }
};
const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {_id} = req
        const data = await compartidoSolicitudModels.findByPk(_id,{
            include : [{   
                model : CompartidoViajeActivo,
                as : "viajeSolicitado",  
            }],
            required: true
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMPARTIDOSOLICITUD")
    }
};

const getItemByDocument = async (req, res) => {
    try {
        req = matchedData(req)
        const {idSolicitante} = req
        const data = await compartidoSolicitudModels.findAll({
            where:{
                idSolicitante : idSolicitante,
                estadoSolicitud: {
                    [Op.or]: ['ACTIVO', 'APROBADA', 'PENDIENTE']
                }
            },
            include:[{
                model: CompartidoViajeActivo,
                as : "viajeSolicitado",
                where: {
                    estado: {
                        [Op.not]: 'FINALIZADA'
                    },
                },
                include:[{
                    model: Usuario,
                    attributes: ['usu_documento', 'usu_nombre', 'usu_img', 'usu_calificacion'],
                 },
                 {
                     model: Vehiculo,
                 }]
             }]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_COMPARTIDOSOLICITUD ${e}`)
    }
};

const getItemTrip = async (req, res) => {
    try {
        req = matchedData(req)
        const { idViajeSolicitado } = req
        const data = await compartidoSolicitudModels.findAll({
            where:  {
                idViajeSolicitado: idViajeSolicitado,
                estadoSolicitud: {
                    [Op.not]: 'CANCELADA'
                },
            },
            include:[{
                model: Usuario,
                attributes: ['usu_documento', 'usu_nombre', 'usu_img', 'usu_calificacion'],
                include: [
                    {
                        model: Pasajero,
                        as: 'pasajero',
                        attributes: ['viajes'],
                    },
                ],
            },
            {
                model: CompartidoViajeActivo,
                as : "viajeSolicitado",
                attributes :['precio', 'pagoAceptado'],    
            }
        ],
        }); 
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_COMPARTIDOSOLICITUD`)
    }
};

const getItemsSolicitudesPagos = async (req, res) => {
    try {
        req = matchedData(req);
        const { idViajeSolicitado } = req;
        // Realizar la consulta con INNER JOIN
        const data = await compartidoSolicitudModels.findAll({
            // where: { idViajeSolicitado: idViajeSolicitado },
            include: [{
                model: CompartidoPagos
            }]
        });

        res.send({ data });
    } catch (e) {
        httpError(res, `ERROR_GET_COMPARTIDO_SOLICITUD_PAGO ${e}` );
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req;
        const data = await compartidoSolicitudModels.create(body);
        const io = socketIoService.getIo();
        if (io) {
            io.emit('solicitud_created', data);
        }

        // --- Enviar Notificación Push al Conductor ---
        try {
            const viaje = await CompartidoViajeActivo.findByPk(data.idViajeSolicitado);
            if (viaje && viaje.conductor) {
                // Obtener el token del conductor y el nombre del pasajero solicitante
                const [conductorTokenRecord, solicitante] = await Promise.all([
                    tokenMsnModels.findOne({ where: { documento: viaje.conductor } }),
                    Usuario.findByPk(data.idSolicitante, { attributes: ['usu_nombre'] })
                ]);

                if (conductorTokenRecord && conductorTokenRecord.token) {
                    const tokenConductor = conductorTokenRecord.token.trim();
                    if (tokenConductor !== '' && tokenConductor.length > 140) {
                        const nombrePasajero = solicitante ? solicitante.usu_nombre : 'Un pasajero';
                        const pushMessage = {
                            token: tokenConductor,
                            notification: {
                                title: 'Nueva solicitud de viaje 🚗',
                                body: `${nombrePasajero} ha solicitado unirse a tu viaje.`
                            },
                            android: {
                                priority: 'high',
                                notification: {
                                    sound: 'default',
                                    channelId: 'high_importance_channel'
                                },
                                data: {
                                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                                    messageType: 'push',
                                    viajeId: data.idViajeSolicitado,
                                    solicitudId: data._id
                                }
                            },
                            apns: {
                                headers: {
                                    'apns-priority': '10',
                                    'apns-push-type': 'alert'
                                },
                                payload: {
                                    aps: {
                                        alert: {
                                            title: 'Nueva solicitud de viaje 🚗',
                                            body: `${nombrePasajero} ha solicitado unirse a tu viaje.`
                                        },
                                        sound: 'default',
                                        badge: 1,
                                        contentAvailable: true
                                    }
                                }
                            },
                            data: {
                                messageType: 'push',
                                viajeId: data.idViajeSolicitado,
                                solicitudId: data._id,
                                timestamp: Date.now().toString()
                            }
                        };

                        console.log(`📤 Enviando push de solicitud al conductor (${viaje.conductor})`);
                        await admin.messaging().send(pushMessage);
                        console.log('✅ Push de solicitud enviado correctamente');
                    } else {
                        console.log(`⚠️ El conductor (${viaje.conductor}) no tiene un token FCM válido registrado.`);
                    }
                } else {
                    console.log(`⚠️ No se encontró token FCM para el conductor (${viaje.conductor})`);
                }
            }
        } catch (pushErr) {
            console.error('❌ Error al enviar notificación push de solicitud:', pushErr);
        }

        res.send('Item Create Complete');
    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOSOLICITUD ${error}`);
    }

};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoSolicitudModels.update(
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
        httpError(res, "ERROR_UPDATE_COMPARTIDOSOLICITUD");
    }
};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const _id = req.params._id;
    try {
        const data = await compartidoSolicitudModels.update(
        objetoACambiar,
        {
            where: { _id: _id }
        })
        let actual = await compartidoSolicitudModels.findByPk(_id);
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "ok"
            });
        }else{
            res.json({
                message: "Update compartidoSolicitud failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOSOLICITUD`);
    }
};


const patchItemIdTrip = async (req, res) => {
    const objetoACambiar = req.body;
    const _id = req.params._id;
    try {
        const [numRowsUpdated] = await compartidoSolicitudModels.update(
            objetoACambiar,
            {
                where: { _id: _id }
            }
        );

        if (numRowsUpdated > 0) {
            res.status(200).json({
                status: 200,
                message: "Update successful",
            });
        } else {
            res.status(404).json({
                status: 404,
                message: "No record found with the given ID",
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOSOLICITUD`);
    }
};



const deleteItem = async (req, res) => {
    try {
        const {_id} = req.params
        const data = await compartidoSolicitudModels.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_COMPARTIDOSOLICITUD")
    }
};


module.exports = {
    getItems, getItem, getItemTrip, createItem, updateItem, patchItem, patchItemIdTrip, deleteItem, getItemByDocument, getItemsSolicitudesPagos, getItemsFilterOrganization
}
