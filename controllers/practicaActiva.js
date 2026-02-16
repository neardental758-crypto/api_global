const { matchedData } = require('express-validator');
const { practicaActivaModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');
const Estacion = require('../models/mysql/estacion');
const { httpError } = require('../utils/handleError');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    const filtro = JSON.parse(req.query.filter);
    const organization = filtro.organizationId;
    try {
        const data = await practicaActivaModels.findAll({
            where: {
                practica_cupos: {
                    [Op.gt]: 0
                },
                practica_estado: 'ACTIVA'
            },
            include : [{
                model : Usuario,
                attributes : ['usu_documento', 'usu_nombre'],
                as: 'Funcionario',
            },{
                model : Estacion,
                attributes : ['est_estacion', 'est_direccion', 'est_descripcion'],
                as: 'Estacion',
                include:[{
                    model: Empresa,
                    attributes: ['emp_id'],
                    where : {
                        emp_id : organization
                    }
                  }],
                required: true,
            }],
            order: [['practica_fecha', 'DESC']]
        });
        res.send({data});
    } catch (error) {
        httpError(res, `ERROR_GET_PRACTICA_ACTIVA ${error}`);
    }
};

const removeOne = async (req, res) => {
    const filtro = JSON.parse(req.query.filter);
    const practice = filtro.idPractice;
    try {
        const record = await practicaActivaModels.findOne({
            where: {
                _id: practice
            }
        });
        if (record) {
            const newCupos = record.practica_cupos - 1;
            await practicaActivaModels.update(
              { practica_cupos: newCupos },
              {
                where: {
                  _id: practice
                }
              }
            );
            res.send('ok')
        } else {
            res.send('bad')
        }
    } catch (error) {
        httpError(res, `ERROR_GET_PRACTICA_ACTIVA ${error}`);
    }
};

const addOne = async (req, res) => {
    const filtro = JSON.parse(req.query.filter);
    const practice = filtro.idPractice;
    try {
        const record = await practicaActivaModels.findOne({
            where: {
                _id: practice
            }
        });
        if (record) {
            const newCupos = record.practica_cupos + 1;
            await practicaActivaModels.update(
              { practica_cupos: newCupos },
              {
                where: {
                  _id: practice
                }
              }
            );
            console.log('Registro actualizado con éxito');
            res.send('ok')
        } else {
            console.log('Registro no encontrado');
            res.send('bad')
        }
    } catch (error) {
        httpError(res, `ERROR_GET_PRACTICA_ACTIVA ${error}`);
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const { _id } = req
        const data = await practicaActivaModels.findByPk(_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_ITEM_PRACTICA_ACTIVA")
    }
};


const patchItem = async (req, res) => {
    try {
        const objetoACambiar = req.body;
        const _id = req.params._id;
        const data = await practicaActivaModels.update(
            objetoACambiar,
            {
                where: { _id: _id }
            })
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_PRACTICA_ACTIVA")
    }
};

const createItem = async (req, res) => {
    try {
        console.log('🔴 BACKEND createItem - Body recibido:', JSON.stringify(req.body, null, 2));
        
        const body = req.body;
        const { practica_fecha, practica_hora_inicio, practica_hora_finalizar, reagendada } = body;

        if (!practica_hora_inicio) {
            console.error('🔴 BACKEND createItem - ERROR: practica_hora_inicio es requerido');
            return res.status(400).send({ 
                error: 'practica_hora_inicio es requerido',
                received: body 
            });
        }

        const fechaBase = new Date(practica_fecha);
        const year = fechaBase.getFullYear();
        const month = fechaBase.getMonth();
        const day = fechaBase.getDate();

        const [startHour, startMinute] = practica_hora_inicio.split(':').map(Number);
        const [finalHour, finalMinute] = practica_hora_finalizar.split(':').map(Number);
        
        const startDateTime = new Date(year, month, day, startHour, startMinute, 0, 0);
        const endDateTime = new Date(year, month, day, finalHour, finalMinute, 0, 0);
        
        console.log('🔴 BACKEND createItem - startDateTime:', startDateTime);
        console.log('🔴 BACKEND createItem - endDateTime:', endDateTime);
        
        const MAX_SESSIONS = 48;
        const createdItems = [];
        let currentSession = new Date(startDateTime);
        let sessionCount = 0;
        
        while (currentSession < endDateTime) {
            if (sessionCount >= MAX_SESSIONS) {
                console.error('🔴 BACKEND createItem - LÍMITE EXCEDIDO');
                return res.status(400).send({
                    error: `Límite de ${MAX_SESSIONS} sesiones excedido`,
                    created: createdItems.length
                });
            }
            
            const sessionEnd = new Date(currentSession);
            sessionEnd.setMinutes(sessionEnd.getMinutes() + 30);
            
            if (sessionEnd <= endDateTime) {
                const _id = uuidv4();
                const horaFinalFormateada = `${String(sessionEnd.getHours()).padStart(2, '0')}:${String(sessionEnd.getMinutes()).padStart(2, '0')}`;
                
                const fechaFormateada = currentSession.toISOString();
                
                const newBody = {
                    ...body,
                    _id,
                    practica_fecha: fechaFormateada,
                    practica_hora_finalizar: horaFinalFormateada,
                    practica_funcionario: body.practica_funcionario.idNumber,
                    reagendada: reagendada || false
                };
                
                const data = await practicaActivaModels.create(newBody);
                createdItems.push(data);
                sessionCount++;
            }
            
            currentSession.setMinutes(currentSession.getMinutes() + 30);
        }
        
        console.log('🔴 BACKEND createItem - Total sesiones creadas:', createdItems.length);
        
        res.status(200).send({ 
            message: 'Items created successfully', 
            data: createdItems,
            totalCreated: createdItems.length,
            isRescheduled: reagendada || false
        });
    } catch (error) {
        console.error('🔴 BACKEND createItem - ERROR FATAL:', error);
        httpError(res, `ERROR_CREATE_PRACTICA_ACTIVA: ${error}`);
    }
};

const createMultipleItems = async (req, res) => {
    try {
        const body = req.body;
        const { 
            practica_fecha_inicio, 
            practica_fecha_fin, 
            practica_hora_inicio, 
            practica_hora_finalizar,
            practica_cupos,
            practica_estacion,
            practica_funcionario,
            practica_estado,
            reagendada
        } = body;

        const [startYear, startMonth, startDay] = practica_fecha_inicio.split('-').map(Number);
        const [endYear, endMonth, endDay] = practica_fecha_fin.split('-').map(Number);
        
        const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
        const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
        
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const MAX_DAYS = 30;
        const MAX_RECORDS = 1000;
        
        if (diffDays > MAX_DAYS) {
            return res.status(400).send({ 
                error: `El rango máximo permitido es ${MAX_DAYS} días. Solicitaste ${diffDays} días.`,
                maxDays: MAX_DAYS,
                requestedDays: diffDays
            });
        }

        const createdItems = [];
        let currentDate = new Date(startDate);
        let recordCount = 0;
        
        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                const [startHour, startMinute] = practica_hora_inicio.split(':').map(Number);
                const [endHour, endMinute] = practica_hora_finalizar.split(':').map(Number);
                
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const day = currentDate.getDate();
                
                const dayStart = new Date(year, month, day, startHour, startMinute, 0, 0);
                const dayEnd = new Date(year, month, day, endHour, endMinute, 0, 0);
                
                let sessionStart = new Date(dayStart);
                
                while (sessionStart < dayEnd) {
                    if (recordCount >= MAX_RECORDS) {
                        return res.status(400).send({
                            error: `Límite de ${MAX_RECORDS} registros excedido`,
                            created: createdItems.length
                        });
                    }
                    
                    const sessionEnd = new Date(sessionStart);
                    sessionEnd.setMinutes(sessionEnd.getMinutes() + 30);
                    
                    if (sessionEnd <= dayEnd) {
                        const _id = uuidv4();
                        const horaFinalFormateada = `${String(sessionEnd.getHours()).padStart(2, '0')}:${String(sessionEnd.getMinutes()).padStart(2, '0')}`;
                        const fechaFormateada = sessionStart.toISOString();
                        
                        const newBody = {
                            _id,
                            practica_cupos,
                            practica_estacion,
                            practica_funcionario: practica_funcionario.idNumber,
                            practica_fecha: fechaFormateada,
                            practica_hora_finalizar: horaFinalFormateada,
                            practica_estado,
                            reagendada: reagendada || false
                        };
                        
                        await practicaActivaModels.create(newBody);
                        createdItems.push(newBody);
                        recordCount++;
                    }
                    
                    sessionStart.setMinutes(sessionStart.getMinutes() + 30);
                }
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        
        res.status(200).send({ 
            message: 'Multiple items created successfully', 
            data: createdItems,
            totalCreated: createdItems.length,
            isRescheduled: reagendada || false
        });
    } catch (error) {
        console.error('🔴 BACKEND - ERROR:', error);
        httpError(res, `ERROR_CREATE_MULTIPLE_PRACTICA_ACTIVA: ${error}`);
    }
};

const updateItem = async (req, res) => {
    // try {
    //     const { body } = req
    //     const data = await practicaActivaModels.update(
    //         {
    //             res_estado: body.estado,
    //         },
    //         {
    //             where: { res_id : body.res_id },
    //         }
    //     )
    //     res.send('ok');
    // } catch (error) {
    //     httpError(res, "ERROR_UPDATE_PRACTICA_ACTIVA");
    // }
};

const getItemsByOrganization = async (req, res) => {
    const filtro = JSON.parse(req.query.filter);
    const organization = filtro.organizationId;
    const page = parseInt(filtro.page) || 0;
    const limit = parseInt(filtro.limit) || 20;
    const offset = page * limit;
    
    try {
        const empresa = await Empresa.findOne({
            where: { emp_id: organization },
            attributes: ['emp_nombre']
        });
        
        if (!empresa) {
            return res.send({ data: [], total: 0 });
        }
        
        const estaciones = await Estacion.findAll({
            where: { est_empresa: empresa.emp_nombre },
            attributes: ['est_estacion']
        });
        
        const estacionesNames = estaciones.map(e => e.est_estacion);
        
        if (estacionesNames.length === 0) {
            return res.send({ data: [], total: 0 });
        }
        
        const { count, rows } = await practicaActivaModels.findAndCountAll({
            where: {
                practica_cupos: {
                    [Op.gt]: 0
                },
                practica_estado: 'ACTIVA',
                practica_estacion: {
                    [Op.in]: estacionesNames
                }
            },
            include : [{
                model : Usuario,
                attributes : ['usu_documento', 'usu_nombre'],
                as: 'Funcionario',
            },{
                model : Estacion,
                attributes : ['est_estacion', 'est_direccion', 'est_descripcion'],
                as: 'Estacion'
            }],
            order: [['practica_fecha', 'DESC']],
            limit: limit,
            offset: offset
        });
        
        res.send({
            data: rows,
            total: count
        });
    } catch (error) {
        httpError(res, `ERROR_GET_PRACTICA_BY_ORG ${error}`);
    }
};

const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem, patchItem, removeOne, addOne,createMultipleItems, getItemsByOrganization
}
