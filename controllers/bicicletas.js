const { matchedData } = require('express-validator');
const { bicicletasModels, estacionModels, empresaModels, bicicleterosModels, historialesModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Bicicletero = require('../models/mysql/bicicleteros');
const Estacion = require('../models/mysql/estacion');
const Empresa = require('../models/mysql/empresa');
const _id_cortezza = '627a8c9931feb31c33377d0e';
const nombre_cortezza = 'Cortezza MDN';
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const { mantenimientoModels } = require("../models");
const { historialMantenimientoModels } = require("../models");
const { componenteModels } = require("../models");
const { categoriaComponenteModels } = require("../models");
const { usuarioModels } = require("../models");
const { sequelize } = require('../config/mysql');
const { prestamosModels } = require('../models');
const Historiales = require('../models/mysql/historiales');
const Prestamos = require('../models/mysql/prestamos');
const Mantenimiento = require('../models/mysql/mantenimiento');
const Reserva = require('../models/mysql/reservas');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await bicicletasModels.findAll({});
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_BICICLETA");
    }
};

const getItemsFilterToBicicleteros = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await bicicletasModels.findAll({
            include: {
                model: Bicicletero
            },
            required: true
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_BICICLETA");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { bic_id } = req;
        const data = await bicicletasModels.findByPk(bic_id, {
            include: {
                model: Bicicletero
            }
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_BICICLETA");
    }
};

const getItemEstacion = async (req, res) => {
    try {
        req = matchedData(req);
        const { bic_estacion } = req;
        const data = await bicicletasModels.findAll({ 
            where: { bic_estacion: bic_estacion },
            include: [{
                model: Estacion,
                where: { est_estacion: bic_estacion }
            }]
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_BICI_ESTACION_NOMBRE");
    }
};

const getItemFlota = async (req, res) => {
    try {
        req = matchedData(req)
        const { bic_estacion } = req
        const data = await bicicletasModels.findAll({ 
            where: { bic_estacion: bic_estacion },
            include:{
                model: Bicicletero,
            },
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_BICI_FLOTA_NOMBRE")
    }
};

const getItemNumero = async (req, res) => {
    try {
        req = matchedData(req)
        const { bic_numero } = req
        const data = await bicicletasModels.findAll({ where: { bic_numero: bic_numero, bic_estado: 'DISPONIBLE' } });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_BICI_NUMERO")
    }
};
const createItem = async (req, res) => {
    const { body } = req
    const t = await sequelize.transaction()
    
    try {
        const { bic_id, ...bicicletaData } = body
        
        const bicicleta = await bicicletasModels.create(bicicletaData, { transaction: t })
        
        const realId = bicicleta.bic_id
        
        if (realId && realId !== 0) {
            const bicicleteroData = {
                bro_nombre: "bicicletero" + realId,
                bro_estacion: body.bic_estacion,
                bro_numero: String(realId),
                bro_bicicleta: Number(realId),
                bro_bluetooth: "123",
                bro_clave: "0000",
            }
            
            const bicicletero = await bicicleterosModels.create(bicicleteroData, { transaction: t })
        } 
        
        await t.commit()
        const responseData = {
            ...body,
            bic_id: realId
        }
        
        res.send({ data: responseData })
        
    } catch (error) {
        await t.rollback()
        console.error('Error completo:', error.message)
        
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            try {
                const { bic_id, ...fallbackData } = body
                const bicicleta = await bicicletasModels.create(fallbackData)
                res.send({ data: { ...body, bic_id: bicicleta.bic_id } })
            } catch (fallbackError) {
                res.status(500).send({ error: 'Error creando bicicleta: ' + fallbackError.message })
            }
        } else {
            res.status(500).send({ error: 'Error: ' + error.message })
        }
    }
};

const obtenerFechaActualFormateada = () => {
    const ahora = new Date();
    const fechaColombia = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
    
    const fechaCompleta = fechaColombia;
    
    const soloHora = fechaColombia.toISOString().slice(11, 19);
    
    return {
        fechaCompleta,
        soloHora
    };
};

const estadosActivosPrestamo = ['PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA', 'PRESTADA'];

const updateItem = async (req, res) => {
    try {
        const { body } = req;

        const bicicletaActual = await bicicletasModels.findOne({
            where: { bic_id: body.bic_id }
        });

        const estadosActivosPrestamo = ['PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA', 'PRESTADA'];
        
        const esPrestamoPersonalizado = bicicletaActual?.bic_estado === 'PRESTAMO PERSONALIZADO';
        const nuevoEstadoNoEsFinalizada = body.bic_estado !== 'FINALIZADA';
        
        const debeFinalizarPrestamos = !(esPrestamoPersonalizado && nuevoEstadoNoEsFinalizada);
        
        if (!estadosActivosPrestamo.includes(body.bic_estado) && debeFinalizarPrestamos) {
            const estadosActivos = ['ACTIVA', 'PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA'];
            const prestamosActivos = await prestamosModels.findAll({
                where: {
                    pre_bicicleta: body.bic_id,
                    pre_estado: estadosActivos
                }
            });

            if (prestamosActivos.length > 0) {
                const prestamoMasReciente = prestamosActivos.reduce((mas_reciente, actual) => {
                    return new Date(actual.pre_retiro_fecha) > new Date(mas_reciente.pre_retiro_fecha) ? actual : mas_reciente;
                });

                const { fechaCompleta, soloHora } = obtenerFechaActualFormateada();

                for (const prestamo of prestamosActivos) {
                    if (prestamo.pre_id === prestamoMasReciente.pre_id) {
                        await prestamosModels.update({
                            pre_estado: 'FINALIZADA',
                            pre_devolucion_fecha: fechaCompleta,
                            pre_devolucion_hora: soloHora
                        }, {
                            where: { pre_id: prestamo.pre_id }
                        });
                    } else {
                        await prestamosModels.update({
                            pre_estado: 'FINALIZADA'
                        }, {
                            where: { pre_id: prestamo.pre_id }
                        });
                    }
                }
            }
        }

        let updateData = { bic_estado: body.bic_estado };

        if (body.bic_estacion !== undefined) {
            updateData.bic_estacion = body.bic_estacion;
        }

        if (body.bic_descripcion !== undefined) {
            updateData.bic_descripcion = body.bic_descripcion;
        }

        const data = await bicicletasModels.update(updateData, {
            where: { bic_id: body.bic_id },
        });

        if (bicicletaActual?.bic_estado === 'CAMBIAR CLAVE' && body.bic_estado === 'DISPONIBLE') {
            await finalizeKeyChange(body.bic_id);
        }

        res.status(200).send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_BICI");
    }
};

const updateEstadoDash = async (req, res) => {
    try {
        const { body } = req;
        
        const bicicletaActual = await bicicletasModels.findOne({
            where: { bic_id: body.bic_id }
        });

        if (!bicicletaActual) {
            return res.status(404).json({
                success: false,
                message: 'Bicicleta no encontrada'
            });
        }

        const estadosActivosPrestamo = ['PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA', 'PRESTADA'];
        
        const esPrestamoPersonalizado = bicicletaActual?.bic_estado === 'PRESTAMO PERSONALIZADO';
        const nuevoEstadoNoEsFinalizada = body.bic_estado !== 'FINALIZADA';
        
        const debeFinalizarPrestamos = !(esPrestamoPersonalizado && nuevoEstadoNoEsFinalizada);
        
        if (!estadosActivosPrestamo.includes(body.bic_estado) && debeFinalizarPrestamos) {
            const estadosActivos = ['ACTIVA', 'PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA'];
            const prestamosActivos = await prestamosModels.findAll({
                where: {
                    pre_bicicleta: body.bic_id,
                    pre_estado: estadosActivos
                }
            });

            if (prestamosActivos.length > 0) {
                const prestamoMasReciente = prestamosActivos.reduce((mas_reciente, actual) => {
                    return new Date(actual.pre_retiro_fecha) > new Date(mas_reciente.pre_retiro_fecha) ? actual : mas_reciente;
                });

                const { fechaCompleta, soloHora } = obtenerFechaActualFormateada();

                for (const prestamo of prestamosActivos) {
                    if (prestamo.pre_id === prestamoMasReciente.pre_id) {
                        await prestamosModels.update({
                            pre_estado: 'FINALIZADA',
                            pre_devolucion_fecha: fechaCompleta,
                            pre_devolucion_hora: soloHora
                        }, {
                            where: { pre_id: prestamo.pre_id }
                        });
                    } else {
                        await prestamosModels.update({
                            pre_estado: 'FINALIZADA'
                        }, {
                            where: { pre_id: prestamo.pre_id }
                        });
                    }
                }
            }
        }

        let updateData = { bic_estado: body.bic_estado };

        if (body.bic_estacion !== undefined) {
            updateData.bic_estacion = body.bic_estacion;
        }

        if (body.bic_descripcion !== undefined) {
            updateData.bic_descripcion = body.bic_descripcion;
        }

        if (body.bic_estado === 'CAMBIAR CLAVE') {
            const transaction = await sequelize.transaction();
            try {
                await handleKeyChange(body.bic_id, transaction);
                
                await bicicletasModels.update(updateData, {
                    where: { bic_id: body.bic_id },
                    transaction
                });
                
                await transaction.commit();
                
                return res.status(200).json({
                    success: true,
                    message: "Estado actualizado a CAMBIAR CLAVE"
                });
                
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        }

        await bicicletasModels.update(updateData, {
            where: { bic_id: body.bic_id },
        });

        if (bicicletaActual?.bic_estado === 'CAMBIAR CLAVE' && body.bic_estado === 'DISPONIBLE') {
            await finalizeKeyChange(body.bic_id);
        }

        res.status(200).json({
            success: true,
            message: "Estado actualizado correctamente"
        });
        
    } catch (error) {
        console.error('Error al actualizar estado desde dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado',
            error: error.message
        });
    }
};

const patchItem = async (req, res) => {
    try {
        const objetoACambiar = req.body;
        const bic_id = req.params.bic_id;

        if (objetoACambiar.bic_estado) {
            const bicicletaActual = await bicicletasModels.findOne({
                where: { bic_id: bic_id }
            });

            const esPrestamoPersonalizado = bicicletaActual?.bic_estado === 'PRESTAMO PERSONALIZADO';
            const nuevoEstadoNoEsFinalizada = objetoACambiar.bic_estado !== 'FINALIZADA';
            
            const debeFinalizarPrestamos = !(esPrestamoPersonalizado && nuevoEstadoNoEsFinalizada);

            const estadosActivosPrestamo = ['PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA', 'PRESTADA'];
            
            if (!estadosActivosPrestamo.includes(objetoACambiar.bic_estado) && debeFinalizarPrestamos) {
                const estadosActivos = ['ACTIVA', 'PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA'];
                const prestamosActivos = await prestamosModels.findAll({
                    where: {
                        pre_bicicleta: bic_id,
                        pre_estado: estadosActivos
                    }
                });

                if (prestamosActivos.length > 0) {
                    const prestamoMasReciente = prestamosActivos.reduce((mas_reciente, actual) => {
                        return new Date(actual.pre_retiro_fecha) > new Date(mas_reciente.pre_retiro_fecha) ? actual : mas_reciente;
                    });

                    const { fechaCompleta, soloHora } = obtenerFechaActualFormateada();

                    for (const prestamo of prestamosActivos) {
                        if (prestamo.pre_id === prestamoMasReciente.pre_id) {
                            await prestamosModels.update({
                                pre_estado: 'FINALIZADA',
                                pre_devolucion_fecha: fechaCompleta,
                                pre_devolucion_hora: soloHora
                            }, {
                                where: { pre_id: prestamo.pre_id }
                            });
                        } else {
                            await prestamosModels.update({
                                pre_estado: 'FINALIZADA'
                            }, {
                                where: { pre_id: prestamo.pre_id }
                            });
                        }
                    }
                }
            }
        }

        if (objetoACambiar.bic_estacion) {
            const bicicleteroActual = await bicicleterosModels.findOne({
                where: { bro_bicicleta: bic_id }
            });

            if (bicicleteroActual) {
                await bicicleterosModels.update({
                    bro_estacion: objetoACambiar.bic_estacion
                }, {
                    where: { bro_id: bicicleteroActual.bro_id }
                });
            } else {
                const bicicleteroDisponible = await bicicleterosModels.findOne({
                    where: {
                        bro_estacion: objetoACambiar.bic_estacion,
                        bro_bicicleta: [null, 0, '']
                    },
                    order: [['bro_id', 'ASC']]
                });

                if (bicicleteroDisponible) {
                    await bicicleterosModels.update({
                        bro_bicicleta: bic_id
                    }, {
                        where: { bro_id: bicicleteroDisponible.bro_id }
                    });
                }
            }
        }

        const result = await bicicletasModels.update(objetoACambiar, {
            where: { bic_id: bic_id }
        });
        
        if (result[0] > 0) {
            res.status(200).json({
                status: 200,
                data: objetoACambiar,
                message: "Update BICICLETA"
            });
        } else {
            res.json({
                message: "Update BICICLETA failed: No rows affected" 
            });
        }
    } catch (error) {
        console.error("Error in patchItem:", error);
        httpError(res, "ERROR_UPDATE_BICICLETA");
    }
};

const handleKeyChange = async (bikeId, transaction) => {
    const bicicletero = await bicicleterosModels.findOne({
        where: { bro_bicicleta: bikeId },
        transaction
    });

    if (!bicicletero) {
        throw new Error('Bicicletero no encontrado para esta bicicleta');
    }

    let usuarioAnterior = null;
    
    const ultimoHistorial = await historialesModels.findOne({
        where: { 
            his_bicicleta: bikeId,
            his_usuario: { [Op.ne]: null }
        },
        order: [['his_fecha', 'DESC']],
        transaction
    });

    if (ultimoHistorial && ultimoHistorial.his_usuario) {
        usuarioAnterior = ultimoHistorial.his_usuario;
    } else {
        usuarioAnterior = '12345678';
    }

    await historialesModels.update(
        { his_estado: 'FINALIZADA' },
        { 
            where: { 
                his_bicicleta: bikeId,
                his_estado: 'CAMBIAR CLAVE' 
            },
            transaction 
        }
    );

    const generateRandomKey = () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
    };

    const claveAnterior = bicicletero.bro_clave;
    const claveNueva = generateRandomKey();
    const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await historialesModels.create({
        his_usuario: usuarioAnterior,
        his_estacion: bicicletero.bro_estacion,
        his_bicicletero: bicicletero.bro_id,
        his_bicicleta: bikeId,
        his_fecha: fechaActual,
        his_clave_old: claveAnterior,
        his_clave_new: claveNueva,
        his_estado: 'CAMBIAR CLAVE'
    }, { transaction });
};

const finalizeKeyChange = async (bikeId, transaction) => {
    // Buscar historial activo
    const historialActivo = await historialesModels.findOne({
        where: {
            his_bicicleta: bikeId,
            his_estado: 'CAMBIAR CLAVE'
        },
        order: [['his_fecha', 'DESC']],
        transaction
    });

    if (historialActivo) {
        // Finalizar historial
        await historialesModels.update(
            { his_estado: 'FINALIZADA' },
            { 
                where: { his_id: historialActivo.his_id },
                transaction 
            }
        );

        // Restaurar clave anterior
        const bicicletero = await bicicleterosModels.findOne({
            where: { bro_bicicleta: bikeId },
            transaction
        });

        if (bicicletero && historialActivo.his_clave_old) {
            await bicicleterosModels.update(
                { bro_clave: historialActivo.his_clave_old },
                { 
                    where: { bro_id: bicicletero.bro_id },
                    transaction 
                }
            );
        }
    }
};

const getBicisEmpresa = async (req, res) => {
    try {
        const { empresaId } = req.params;

        // Primero obtenemos la empresa
        const empresa = await empresaModels.findOne({
            where: { emp_id: empresaId }
        });

        if (!empresa) {
            return res.send({ data: [] });
        }

        // Obtenemos las estaciones de esa empresa
        const estaciones = await estacionModels.findAll({
            where: { 
                est_empresa: empresa.emp_nombre 
            }
        });

        if (!estaciones || estaciones.length === 0) {
            return res.send({ data: [] });
        }

        const estacionesNombres = estaciones.map(est => est.est_estacion);

        // Obtenemos las bicicletas de esas estaciones
        const bicicletas = await bicicletasModels.findAll({
            where: {
                bic_estacion: {
                    [Op.in]: estacionesNombres
                }
            },
            include: {
                model: Bicicletero
            }
        });

        res.send({ data: bicicletas });
    } catch (error) {
        console.error('Error en getBicisEmpresa:', error);
        httpError(res, "ERROR_GET_BICIS_EMPRESA");
    }
};

const deleteItem = (req, res) => { };

//cortezza
const getItems_cortezza = async (req, res) => {
    try {
        const _id_cortezza = req.params._id_cortezza; // Asegúrate de recibir este parámetro correctamente.

        const data = await bicicletasModels.findAll({
            include: [
                {
                    model: Estacion,
                    attributes: ['est_empresa'],
                    where : {
                        est_empresa : nombre_cortezza
                    }
                },
            ],
        });

        res.send({ data });
    } catch (error) {
        console.error("Error al obtener las bicicletas:", error);
        httpError(res, "ERROR_GET_ITEM_BICICLETA_CORTEZZA");
    }
};


const get_id_cortezza = async (req, res) => {
    try {
        req = matchedData(req);
        const { bic_id } = req;
        const data = await bicicletasModels.findByPk(bic_id, {
            include: [
                {
                    model: Bicicletero
                },
                {
                    model: Estacion,
                    attributes: ['est_empresa'],
                    where : {
                        est_empresa : nombre_cortezza
                    }
                }
            ]
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_BICICLETA");
    }
};

const getItemEstacion_cortezza = async (req, res) => {
    try {
        req = matchedData(req)
        const { bic_estacion } = req
        const data = await bicicletasModels.findAll({
            where: {
                bic_estacion: bic_estacion,
                bic_estado: 'DISPONIBLE',
            },
            include: [
                {
                    model: Estacion,
                    attributes: ['est_empresa'],
                    where: {
                        est_empresa: nombre_cortezza,
                    },
                },
            ],
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_BICI_ESTACION_NOMBRE")
    }
};


const getItemFlota_cortezza = async (req, res) => {
    try {
        req = matchedData(req)
        const { bic_estacion } = req
        const data = await bicicletasModels.findAll({ 
            where: { bic_estacion: bic_estacion },
            include: [
                {
                    model: Estacion,
                    attributes: ['est_empresa'],
                    where: {
                        est_empresa: nombre_cortezza,
                    },
                },
                {
                    model: Bicicletero,
                },
            ]
        });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_BICI_FLOTA_NOMBRE")
    }
};

const getBicisByEstacion = async (req, res) => {
    try {
        req = matchedData(req);
        const { est_estacion } = req;
        
        const data = await bicicletasModels.findAll({
            where: { bic_estacion: est_estacion },
            include: [{
                model: Estacion,
                where: { est_estacion: est_estacion }
            }]
        });
        
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_BICIS_BY_ESTACION");
    }
};

// 1. Endpoint para obtener totales por estado
const getBicicletasPorEstado = async (req, res) => {
    try {
        // Estados válidos
        const estadosValidos = [
            'DISPONIBLE', 'RESERVADA', 'PRESTADA',
            'PRESTAMO PERSONALIZADO', 'CAMBIAR CLAVE', 'PRESTAMO DE EMERGENCIA'
        ];

        // Obtener estado desde query params
        const { estado } = req.query;
        
        let whereCondition = {};
        if (estado) {
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({
                    error: "Estado no válido",
                    estadosValidos
                });
            }
            whereCondition.bic_estado = estado;
        } else {
            whereCondition.bic_estado = {
                [Op.in]: estadosValidos
            };
        }
        
        // Obtener bicicletas agrupadas por estado
        const data = await bicicletasModels.findAll({
            where: whereCondition,
            attributes: [
                'bic_estado',
                [Sequelize.fn('COUNT', Sequelize.col('bic_id')), 'total']
            ],
            group: ['bic_estado'],
            order: [['bic_estado', 'ASC']]
        });

        // Calcular total
        const totalGeneral = data.reduce((sum, item) => sum + parseInt(item.dataValues.total), 0);
        
        res.send({ 
            data,
            totalGeneral
        });

    } catch (error) {
        console.error("Error al obtener bicicletas por estado:", error);
        httpError(res, "ERROR_GET_BICIS_POR_ESTADO");
    }
};


    // 2. Endpoint para obtener totales por estado y estación
    const getBicicletasPorEstadoYEstacion = async (req, res) => {
        try {
            const estadosValidos = [
                'DISPONIBLE', 'RESERVADA', 'PRESTADA',
                'PRESTAMO PERSONALIZADO', 'CAMBIAR CLAVE', 'PRESTAMO DE EMERGENCIA'
            ];

            let { estacion } = req.params;
            if (!estacion) {
                return res.status(400).json({
                    error: "Debe proporcionar una estación"
                });
            }
            
            estacion = decodeURIComponent(estacion);
            
            const estacionExiste = await estacionModels.findOne({
                where: Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('est_estacion')), 
                    Sequelize.fn('LOWER', estacion)
                )
            });

            if (!estacionExiste) {
                return res.status(404).json({
                    error: "La estación especificada no existe"
                });
            }

            const nombreEstacionCorrecto = estacionExiste.est_estacion;
            
            const { estado } = req.query;
            
            let whereCondition = { bic_estacion: nombreEstacionCorrecto };
            if (estado) {
                if (!estadosValidos.includes(estado)) {
                    return res.status(400).json({
                        error: "Estado no válido",
                        estadosValidos
                    });
                }
                whereCondition.bic_estado = estado;
            } else {
                whereCondition.bic_estado = {
                    [Op.in]: estadosValidos
                };
            }

            const data = await bicicletasModels.findAll({
                where: whereCondition,
                attributes: [
                    'bic_estado',
                    [Sequelize.fn('COUNT', Sequelize.col('bic_id')), 'total']
                ],
                group: ['bic_estado'],
                order: [['bic_estado', 'ASC']]
            });

            const totalEstacion = data.reduce((sum, item) => sum + parseInt(item.dataValues.total), 0);

            res.send({ 
                estacion: estacionExiste.est_nombre,
                data,
                totalEstacion
            });

        } catch (error) {
            console.error("Error al obtener bicicletas por estado y estación:", error);
            httpError(res, "ERROR_GET_BICIS_POR_ESTADO_Y_ESTACION");
        }
    };


// 3. Endpoint para obtener totales por estado y empresa
const getBicicletasPorEstadoYEmpresa = async (req, res) => {
    try {
        // Estados válidos para filtrar
        const estadosValidos = [
            'DISPONIBLE', 'RESERVADA', 'PRESTADA',
            'PRESTAMO PERSONALIZADO', 'CAMBIAR CLAVE', 'PRESTAMO DE EMERGENCIA'
        ];

        // Obtener empresaId del request
        const { empresaId } = req.params;
        if (!empresaId) {
            return res.status(400).json({
                error: "Debe proporcionar un ID de empresa"
            });
        }

        // Buscar la empresa en la base de datos
        const empresa = await empresaModels.findOne({
            where: { emp_id: empresaId }
        });

        if (!empresa) {
            return res.status(404).json({
                error: "La empresa especificada no existe"
            });
        }

        // Obtener estaciones de la empresa
        const estaciones = await estacionModels.findAll({
            where: { est_empresa: empresa.emp_nombre }
        });

        if (!estaciones || estaciones.length === 0) {
            return res.send({
                empresa: empresa.emp_nombre,
                data: [],
                totalEmpresa: 0
            });
        }

        // Extraer nombres de estaciones
        const estacionesNombres = estaciones.map(est => est.est_estacion);

        // Obtener el estado de las bicicletas desde los query params
        const { estado } = req.query;

        let whereCondition = {
            bic_estacion: {
                [Op.in]: estacionesNombres
            }
        };

        if (estado) {
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({
                    error: "Estado no válido",
                    estadosValidos
                });
            }
            whereCondition.bic_estado = estado;
        } else {
            whereCondition.bic_estado = {
                [Op.in]: estadosValidos
            };
        }

        // Obtener bicicletas con filtro por estado
        const bicicletas = await bicicletasModels.findAll({
            where: whereCondition,
            include: {
                model: Bicicletero
            }
        });

        // Contar bicicletas agrupadas por estado
        const data = await bicicletasModels.findAll({
            where: whereCondition,
            attributes: [
                'bic_estado',
                [Sequelize.fn('COUNT', Sequelize.col('bic_id')), 'total']
            ],
            group: ['bic_estado']
        });

        // Contar bicicletas agrupadas por estación
        const dataEstaciones = await bicicletasModels.findAll({
            where: whereCondition,
            attributes: [
                'bic_estacion',
                [Sequelize.fn('COUNT', Sequelize.col('bic_id')), 'total']
            ],
            group: ['bic_estacion']
        });

        // Calcular el total de bicicletas activas
        const totalEmpresa = data.reduce((sum, item) => sum + parseInt(item.dataValues.total), 0);

        res.send({
            empresa: empresa.emp_nombre,
            data,
            detalleEstaciones: dataEstaciones,
            totalEmpresa
        });

    } catch (error) {
        console.error("Error al obtener bicicletas por estado y empresa:", error);
        httpError(res, "ERROR_GET_BICIS_POR_ESTADO_Y_EMPRESA");
    }
};

/**
 * Obtener mantenimientos por bicicleta con detalles detallados
 */
const getMantenimientosPorBicicleta = async (req, res) => {
    try {
      const { bicicletaId } = req.params;
      
      // Validar que la bicicleta existe
      const bicicleta = await bicicletasModels.findByPk(bicicletaId);
      if (!bicicleta) {
        return res.status(404).send({ 
          error: "BICICLETA_NO_ENCONTRADA",
          message: "La bicicleta especificada no existe" 
        });
      }
      
      // Obtener todos los mantenimientos de esta bicicleta
      const mantenimientos = await mantenimientoModels.findAll({
        where: { bicicleta_id: bicicletaId },
        include: [
          {
            model: historialMantenimientoModels,
            include: [
              {
                model: componenteModels,
                attributes: ['comp_id', 'comp_nombre', 'categoria_id'],
                include: [
                  {
                    model: categoriaComponenteModels,
                    attributes: ['cat_id', 'cat_nombre', 'cat_descripcion']
                  }
                ]
              }
            ]
          },
          {
            model: usuarioModels,
            as: 'operario',
            attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_ciudad']
          }
        ],
        order: [['fecha_creacion', 'DESC']]
      });
      
      res.send({ data: mantenimientos });
    } catch (error) {
      console.error("Error al obtener mantenimientos por bicicleta:", error);
      res.status(500).send({ 
        error: "ERROR_GET_MANTENIMIENTOS_POR_BICICLETA",
        message: "Error al obtener el historial de mantenimientos" 
      });
    }
  };

const syncBikesStates = async (req, res) => {
    try {
        const { bikes } = req.body;
        const updated = [];
        
        for (const bike of bikes) {
            const [rowsUpdated] = await bicicletasModels.update(
                { bic_estado: bike.state },
                { where: { bic_numero: bike.number } }
            );
            
            if (rowsUpdated > 0) {
                updated.push(bike.number);
            }
        }
        
        res.send({ 
            success: true, 
            updated: updated.length,
            bikes: updated
        });
    } catch (error) {
        httpError(res, "ERROR_SYNC_BIKES_STATES");
    }
};

const getBikeMetrics = async (req, res) => {
  try {
    const { empresaId } = req.params;
    let { startDate, endDate, state } = req.query;

    state = state ? state.split('?')[0].trim() : 'all';

    console.log('Estado recibido para filtrar:', state);

    if (!startDate || !endDate) {
      return res.status(400).send({ 
        error: "Fechas requeridas",
        availableBikes: 0,
        stateBreakdown: {},
        bikeDetails: [],
        totalBikes: 0
      });
    }

    const empresa = await empresaModels.findOne({
      where: { emp_id: empresaId }
    });

    if (!empresa) {
      return res.send({ 
        availableBikes: 0,
        stateBreakdown: {},
        bikeDetails: [],
        totalBikes: 0
      });
    }

    const estaciones = await estacionModels.findAll({
      where: { est_empresa: empresa.emp_nombre }
    });

    if (!estaciones || estaciones.length === 0) {
      return res.send({ 
        availableBikes: 0,
        stateBreakdown: {},
        bikeDetails: [],
        totalBikes: 0
      });
    }

    const estacionesNombres = estaciones.map(est => est.est_estacion);

    const bicicletas = await bicicletasModels.findAll({
      where: {
        bic_estacion: {
          [Op.in]: estacionesNombres
        }
      }
    });

    const startDateTime = new Date(startDate + 'T00:00:00');
    const endDateTime = new Date(endDate + 'T23:59:59');

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).send({ 
        error: "Formato de fecha inválido",
        availableBikes: 0,
        stateBreakdown: {},
        bikeDetails: [],
        totalBikes: 0
      });
    }

    const bikeIds = bicicletas.map(b => b.bic_id);

    if (bikeIds.length === 0) {
      return res.send({ 
        availableBikes: 0,
        stateBreakdown: {},
        bikeDetails: [],
        totalBikes: 0
      });
    }

    const totalRangeMs = endDateTime.getTime() - startDateTime.getTime();

    const parseFlexibleDate = (dateValue) => {
      if (!dateValue) return null;
      
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      return null;
    };

    const prestamos = await Prestamos.findAll({
      where: {
        pre_bicicleta: {
          [Op.in]: bikeIds
        }
      }
    });

    const mantenimientos = await Mantenimiento.findAll({
      where: {
        bicicleta_id: {
          [Op.in]: bikeIds
        }
      }
    });

    const reservas = await Reserva.findAll({
      where: {
        res_bicicleta: {
          [Op.in]: bikeIds
        }
      }
    });

    const stateBreakdown = {
      DISPONIBLE: 0,
      "EN TALLER": 0,
      PRESTADA: 0,
      RESERVADA: 0,
      "PRESTAMO PERSONALIZADO": 0,
      "PRESTAMO DE EMERGENCIA": 0,
      INACTIVA: 0,
      "CAMBIAR CLAVE": 0
    };

    const bikeDetails = [];
    let totalAvailableTime = 0;

    for (const bike of bicicletas) {
      const bikeId = bike.bic_id;
      const currentState = bike.bic_estado || "DISPONIBLE";
      
      const bikePrestamos = prestamos.filter(p => p.pre_bicicleta === bikeId);
      const bikeMantenimientos = mantenimientos.filter(m => m.bicicleta_id === bikeId);
      const bikeReservas = reservas.filter(r => r.res_bicicleta === bikeId);

      const occupiedPeriods = [];

      for (const mant of bikeMantenimientos) {
        if (!mant.fecha_creacion) continue;

        const mantStartDate = parseFlexibleDate(mant.fecha_creacion);
        if (!mantStartDate) continue;

        const mantStart = mantStartDate.getTime();
        const mantEnd = mant.fecha_finalizacion 
          ? (parseFlexibleDate(mant.fecha_finalizacion)?.getTime() || endDateTime.getTime())
          : endDateTime.getTime();

        const overlaps = 
          (mantStart >= startDateTime.getTime() && mantStart <= endDateTime.getTime()) ||
          (mantEnd >= startDateTime.getTime() && mantEnd <= endDateTime.getTime()) ||
          (mantStart <= startDateTime.getTime() && mantEnd >= endDateTime.getTime());

        if (overlaps) {
          const effectiveStart = Math.max(mantStart, startDateTime.getTime());
          const effectiveEnd = Math.min(mantEnd, endDateTime.getTime());
          
          if (effectiveStart < effectiveEnd) {
            occupiedPeriods.push({
              start: effectiveStart,
              end: effectiveEnd,
              state: "EN TALLER"
            });
          }
        }
      }

      for (const prest of bikePrestamos) {
        if (!prest.pre_retiro_fecha) continue;

        const prestStartDate = parseFlexibleDate(prest.pre_retiro_fecha);
        if (!prestStartDate) continue;

        const prestStart = prestStartDate.getTime();
        const prestEnd = prest.pre_devolucion_fecha 
          ? (parseFlexibleDate(prest.pre_devolucion_fecha)?.getTime() || endDateTime.getTime())
          : endDateTime.getTime();

        const overlaps = 
          (prestStart >= startDateTime.getTime() && prestStart <= endDateTime.getTime()) ||
          (prestEnd >= startDateTime.getTime() && prestEnd <= endDateTime.getTime()) ||
          (prestStart <= startDateTime.getTime() && prestEnd >= endDateTime.getTime());

        if (overlaps) {
          const effectiveStart = Math.max(prestStart, startDateTime.getTime());
          const effectiveEnd = Math.min(prestEnd, endDateTime.getTime());
          
          if (effectiveStart < effectiveEnd) {
            let stateName = "PRESTADA";
            
            if (prest.pre_dispositivo === "web_pp") {
              stateName = "PRESTAMO PERSONALIZADO";
            } else if (prest.pre_dispositivo === "web_pe") {
              stateName = "PRESTAMO DE EMERGENCIA";
            }

            occupiedPeriods.push({
              start: effectiveStart,
              end: effectiveEnd,
              state: stateName
            });
          }
        }
      }

      for (const res of bikeReservas) {
        if (!res.res_fecha_inicio) continue;

        let resStartStr = res.res_fecha_inicio;
        if (res.res_hora_inicio) {
          resStartStr = `${res.res_fecha_inicio} ${res.res_hora_inicio}`;
        }
        const resStartDate = parseFlexibleDate(resStartStr);
        if (!resStartDate) continue;

        const resStart = resStartDate.getTime();

        let resEnd;
        if (res.res_fecha_fin) {
          let resEndStr = res.res_fecha_fin;
          if (res.res_hora_fin) {
            resEndStr = `${res.res_fecha_fin} ${res.res_hora_fin}`;
          }
          const resEndDate = parseFlexibleDate(resEndStr);
          resEnd = resEndDate ? resEndDate.getTime() : (resStart + 3600000);
        } else {
          resEnd = resStart + 3600000;
        }

        const overlaps = 
          (resStart >= startDateTime.getTime() && resStart <= endDateTime.getTime()) ||
          (resEnd >= startDateTime.getTime() && resEnd <= endDateTime.getTime()) ||
          (resStart <= startDateTime.getTime() && resEnd >= endDateTime.getTime());

        if (overlaps) {
          const effectiveStart = Math.max(resStart, startDateTime.getTime());
          const effectiveEnd = Math.min(resEnd, endDateTime.getTime());
          
          if (effectiveStart < effectiveEnd) {
            occupiedPeriods.push({
              start: effectiveStart,
              end: effectiveEnd,
              state: "RESERVADA"
            });
          }
        }
      }

      occupiedPeriods.sort((a, b) => a.start - b.start);

      const mergedPeriods = [];
      for (const period of occupiedPeriods) {
        if (mergedPeriods.length === 0) {
          mergedPeriods.push({...period});
        } else {
          const last = mergedPeriods[mergedPeriods.length - 1];
          if (period.start <= last.end) {
            last.end = Math.max(last.end, period.end);
          } else {
            mergedPeriods.push({...period});
          }
        }
      }

      const timeInStates = {
        DISPONIBLE: 0,
        "EN TALLER": 0,
        PRESTADA: 0,
        RESERVADA: 0,
        "PRESTAMO PERSONALIZADO": 0,
        "PRESTAMO DE EMERGENCIA": 0
      };

      for (const period of mergedPeriods) {
        const duration = period.end - period.start;
        timeInStates[period.state] += duration;
      }

      let totalOccupiedTime = 0;
      for (const period of mergedPeriods) {
        totalOccupiedTime += (period.end - period.start);
      }

      timeInStates["DISPONIBLE"] = Math.max(0, totalRangeMs - totalOccupiedTime);

      stateBreakdown[currentState]++;

      const shouldInclude = state === "all" || currentState === state;

      if (shouldInclude) {
        bikeDetails.push({
          bic_id: bike.bic_id,
          bic_numero: bike.bic_numero,
          bic_estacion: bike.bic_estacion,
          currentState: currentState,
          timeBreakdown: {
            disponible: Math.min(100, Math.round((timeInStates["DISPONIBLE"] / totalRangeMs) * 100)),
            enTaller: Math.min(100, Math.round((timeInStates["EN TALLER"] / totalRangeMs) * 100)),
            prestada: Math.min(100, Math.round((timeInStates["PRESTADA"] / totalRangeMs) * 100)),
            reservada: Math.min(100, Math.round((timeInStates["RESERVADA"] / totalRangeMs) * 100)),
            prestamoPersonalizado: Math.min(100, Math.round((timeInStates["PRESTAMO PERSONALIZADO"] / totalRangeMs) * 100)),
            prestamoEmergencia: Math.min(100, Math.round((timeInStates["PRESTAMO DE EMERGENCIA"] / totalRangeMs) * 100))
          }
        });
      }

      totalAvailableTime += timeInStates["DISPONIBLE"];
    }

    const averageAvailability = bicicletas.length > 0 
      ? Math.round((totalAvailableTime / (totalRangeMs * bicicletas.length)) * 100)
      : 0;

    const result = {
      availableBikes: stateBreakdown["DISPONIBLE"],
      averageAvailability,
      stateBreakdown,
      bikeDetails,
      totalBikes: bicicletas.length
    };

    res.send(result);
  } catch (error) {
    console.error('Error en getBikeMetrics:', error);
    httpError(res, "ERROR_GET_BIKE_METRICS");
  }
};

module.exports = {
    getItems, getItem, getItemNumero, getItemEstacion, getItemFlota, createItem, updateItem, deleteItem, getItems_cortezza, get_id_cortezza, getItemEstacion_cortezza, getItemFlota_cortezza, getItemsFilterToBicicleteros, getBicisEmpresa, patchItem,
    getBicisByEstacion,getBicicletasPorEstado, getBicicletasPorEstadoYEstacion, getBicicletasPorEstadoYEmpresa,
    getMantenimientosPorBicicleta,updateEstadoDash,syncBikesStates,getBikeMetrics
}