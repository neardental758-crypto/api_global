// controllers/mantenimientos.js
const { sequelize } = require("../config/mysql");
const { bicicletasModels, componenteModels, estadoComponenteModels, historialMantenimientoModels, categoriaComponenteModels} = require("../models");
const { matchedData } = require("express-validator");
const { mantenimientoModels } = require("../models");
const { usuarioModels } = require("../models");
const { Op } = require('sequelize');
const { handleHttpError } = require("../utils/handleError");

/**
 * Obtener lista de todos los mantenimientos
 */
const getMantenimientos = async (req, res) => {
    try {
        let page = 1;
        let limit = 10;
        
        if (req.query.filter) {
            const filter = JSON.parse(req.query.filter);
            page = parseInt(filter.page) || 1;
            limit = parseInt(filter.limit) || 10;
        } else {
            page = parseInt(req.query.page) || 1;
            limit = parseInt(req.query.limit) || 10;
        }
        
        const offset = (page - 1) * limit;
        
        const data = await mantenimientoModels.findAll({
            include: [
                {
                    model: bicicletasModels,
                    attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado']
                },
                {
                    model: usuarioModels,
                    as: 'operario',
                    attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_ciudad']
                }
            ],
            limit,
            offset,
            order: [['fecha_creacion', 'DESC']]
        });
        
        const count = await mantenimientoModels.count();
        
        res.send({ 
            data,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_GET_MANTENIMIENTOS");
    }
};

const getMantenimientoPorId = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const data = await mantenimientoModels.findByPk(id, {
            include: [
                {
                    model: bicicletasModels,
                    attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado']
                },
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
            ]
        });
        
        if (!data) {
            return handleHttpError(res, "MANTENIMIENTO_NO_ENCONTRADO", 404);
        }
        
        res.send({ data });
    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_GET_MANTENIMIENTO");
    }
};

const getMantenimientosPorEmpresa = async (req, res) => {
    try {
        const { empresa_id } = matchedData(req);
        
        let page = 1;
        let limit = 10;
        
        if (req.query.filter) {
            const filter = JSON.parse(req.query.filter);
            page = parseInt(filter.page) || 1;
            limit = parseInt(filter.limit) || 10;
        } else {
            page = parseInt(req.query.page) || 1;
            limit = parseInt(req.query.limit) || 10;
        }
        
        const offset = (page - 1) * limit;
        const whereClause = { empresa_id };
        const filterObj = req.query.filter ? JSON.parse(req.query.filter) : req.query;
        
        if (filterObj.operario_id) whereClause.operario_id = filterObj.operario_id;
        if (filterObj.estado && filterObj.estado !== 'todos') whereClause.estado = filterObj.estado;
        if (filterObj.prioridad && filterObj.prioridad !== 'todos') whereClause.prioridad = filterObj.prioridad;
        if (filterObj.tipo && filterObj.tipo !== 'todos') whereClause.tipo_mantenimiento = filterObj.tipo;

        
        if (filterObj.fecha_inicio || filterObj.fecha_fin) {
            whereClause.fecha_creacion = {};
            if (filterObj.fecha_inicio) whereClause.fecha_creacion[Op.gte] = new Date(filterObj.fecha_inicio);
            if (filterObj.fecha_fin) {
                const fechaFin = new Date(filterObj.fecha_fin);
                fechaFin.setHours(23, 59, 59, 999);
                whereClause.fecha_creacion[Op.lte] = fechaFin;
            }
        }

        if (filterObj.ordenar_por === 'fecha_hoy') {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const mañana = new Date(hoy);
            mañana.setDate(mañana.getDate() + 1);
            whereClause.fecha_creacion = {
                [Op.gte]: hoy,
                [Op.lt]: mañana
            };
        }

        const includes = [
            {
                model: usuarioModels,
                as: 'operario',
                attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_ciudad']
            }
        ];

        const bicicletaWhere = {};
        let hasBicicletaFilter = false;

        if (filterObj.bicicleta) {
            hasBicicletaFilter = true;
            bicicletaWhere[Op.or] = [
                { bic_numero: { [Op.like]: `%${filterObj.bicicleta}%` } },
                { bic_id: isNaN(filterObj.bicicleta) ? null : parseInt(filterObj.bicicleta) }
            ];
        }

        if (filterObj.ordenar_por === 'bicicletas_taller') {
            hasBicicletaFilter = true;
            bicicletaWhere.bic_estado = {
                [Op.in]: ['EN_MANTENIMIENTO', 'EN TALLER', 'REPARACION', 'REVISION']
            };
        }

        includes.push({
            model: bicicletasModels,
            where: hasBicicletaFilter ? bicicletaWhere : undefined,
            attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado']
        });

        let orderBy = [['fecha_creacion', 'DESC']];
        if (filterObj.ordenar_por) {
            switch(filterObj.ordenar_por) {
                case 'fecha_creacion_asc':
                    orderBy = [['fecha_creacion', 'ASC']];
                    break;
                case 'pendientes_primero':
                    orderBy = [[sequelize.literal("CASE WHEN estado = 'pendiente' THEN 0 ELSE 1 END"), 'ASC'], ['fecha_creacion', 'DESC']];
                    break;
                case 'en_proceso_primero':
                    orderBy = [[sequelize.literal("CASE WHEN estado = 'en_proceso' THEN 0 ELSE 1 END"), 'ASC'], ['fecha_creacion', 'DESC']];
                    break;
            }
        }

        const { count, rows } = await mantenimientoModels.findAndCountAll({
            where: whereClause,
            include: includes,
            limit,
            offset,
            order: orderBy,
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
        console.error(error);
        handleHttpError(res, "ERROR_GET_MANTENIMIENTOS_POR_EMPRESA");
    }
};

const getMantenimientosPorEstacion = async (req, res) => {
    try {
        const { estacion_id } = matchedData(req);
        
        let page = 1;
        let limit = 10;
        
        if (req.query.filter) {
            const filter = JSON.parse(req.query.filter);
            page = parseInt(filter.page) || 1;
            limit = parseInt(filter.limit) || 10;
        } else {
            page = parseInt(req.query.page) || 1;
            limit = parseInt(req.query.limit) || 10;
        }
        
        const offset = (page - 1) * limit;
        const whereClause = {};
        const filterObj = req.query.filter ? JSON.parse(req.query.filter) : req.query;
        
        if (filterObj.operario_id) whereClause.operario_id = filterObj.operario_id;
        if (filterObj.estado && filterObj.estado !== 'todos') whereClause.estado = filterObj.estado;
        if (filterObj.prioridad && filterObj.prioridad !== 'todos') whereClause.prioridad = filterObj.prioridad;
        if (filterObj.tipo && filterObj.tipo !== 'todos') whereClause.tipo_mantenimiento = filterObj.tipo;
        
        if (filterObj.fecha_inicio || filterObj.fecha_fin) {
            whereClause.fecha_creacion = {};
            if (filterObj.fecha_inicio) whereClause.fecha_creacion[Op.gte] = new Date(filterObj.fecha_inicio);
            if (filterObj.fecha_fin) {
                const fechaFin = new Date(filterObj.fecha_fin);
                fechaFin.setHours(23, 59, 59, 999);
                whereClause.fecha_creacion[Op.lte] = fechaFin;
            }
        }

        if (filterObj.ordenar_por === 'fecha_hoy') {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const mañana = new Date(hoy);
            mañana.setDate(mañana.getDate() + 1);
            whereClause.fecha_creacion = {
                [Op.gte]: hoy,
                [Op.lt]: mañana
            };
        }

        const includes = [
            {
                model: usuarioModels,
                as: 'operario',
                attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_ciudad']
            }
        ];

        const bicicletaWhere = { bic_estacion: estacion_id };
        
        if (filterObj.bicicleta) {
            bicicletaWhere[Op.or] = [
                { bic_numero: { [Op.like]: `%${filterObj.bicicleta}%` } },
                { bic_id: isNaN(filterObj.bicicleta) ? null : parseInt(filterObj.bicicleta) }
            ];
        }

        if (filterObj.ordenar_por === 'bicicletas_taller') {
            bicicletaWhere.bic_estado = {
                [Op.in]: ['EN_MANTENIMIENTO', 'EN TALLER', 'REPARACION', 'REVISION']
            };
        }

        includes.push({
            model: bicicletasModels,
            where: bicicletaWhere,
            attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado']
        });

        let orderBy = [['fecha_creacion', 'DESC']];
        if (filterObj.ordenar_por) {
            switch(filterObj.ordenar_por) {
                case 'fecha_creacion_asc':
                    orderBy = [['fecha_creacion', 'ASC']];
                    break;
                case 'pendientes_primero':
                    orderBy = [[sequelize.literal("CASE WHEN estado = 'pendiente' THEN 0 ELSE 1 END"), 'ASC'], ['fecha_creacion', 'DESC']];
                    break;
                case 'en_proceso_primero':
                    orderBy = [[sequelize.literal("CASE WHEN estado = 'en_proceso' THEN 0 ELSE 1 END"), 'ASC'], ['fecha_creacion', 'DESC']];
                    break;
            }
        }

        const { count, rows } = await mantenimientoModels.findAndCountAll({
            where: whereClause,
            include: includes,
            limit,
            offset,
            order: orderBy,
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
        console.error(error);
        handleHttpError(res, "ERROR_GET_MANTENIMIENTOS_POR_ESTACION");
    }
};


const getMantenimientosPorBicicleta = async (req, res) => {
    try {
        const { bicicleta_id } = matchedData(req);
        
        const data = await mantenimientoModels.findAll({
            where: { bicicleta_id },
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
            ]
        });
        
        res.send({ data });
    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_GET_MANTENIMIENTOS_POR_BICICLETA");
    }
};

/**
 * Actualizar mantenimiento
 */
const actualizarMantenimiento = async (req, res) => {
    try {
        const { id, ...body } = matchedData(req);
        
        const mantenimiento = await mantenimientoModels.findByPk(id);
        if (!mantenimiento) {
            return handleHttpError(res, "MANTENIMIENTO_NO_ENCONTRADO", 404);
        }
        
        // Si el estado es finalizado, agregar fecha de finalización
        if (body.estado === 'finalizado' && mantenimiento.estado !== 'finalizado') {
            body.fecha_finalizacion = new Date();
        }
        
        await mantenimiento.update(body);
        
        const dataActualizada = await mantenimientoModels.findByPk(id, {
            include: [
                {
                    model: historialMantenimientoModels,
                    include: [
                        {
                            model: componenteModels,
                            attributes: ['comp_id', 'comp_nombre', 'categoria_id']
                        }
                    ]
                }
            ]
        });
        
        res.send({ data: dataActualizada });
    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_ACTUALIZAR_MANTENIMIENTO");
    }
};

const getMantenimientosPorOperario = async (req, res) => {
    try {
        const { operario_id } = matchedData(req);
        
        let page = 1;
        let limit = 10;
        
        if (req.query.filter) {
            const filter = JSON.parse(req.query.filter);
            page = parseInt(filter.page) || 1;
            limit = parseInt(filter.limit) || 10;
        } else {
            page = parseInt(req.query.page) || 1;
            limit = parseInt(req.query.limit) || 10;
        }
        
        const offset = (page - 1) * limit;
        const whereClause = { operario_id };
        const filterObj = req.query.filter ? JSON.parse(req.query.filter) : req.query;
        
        
        if (filterObj.empresa_id) whereClause.empresa_id = filterObj.empresa_id;
        if (filterObj.estado && filterObj.estado !== 'todos') whereClause.estado = filterObj.estado;
        if (filterObj.prioridad && filterObj.prioridad !== 'todos') whereClause.prioridad = filterObj.prioridad;
        
        if (filterObj.fecha_inicio || filterObj.fecha_fin) {
            whereClause.fecha_creacion = {};
            if (filterObj.fecha_inicio) whereClause.fecha_creacion[Op.gte] = new Date(filterObj.fecha_inicio);
            if (filterObj.fecha_fin) {
                const fechaFin = new Date(filterObj.fecha_fin);
                fechaFin.setHours(23, 59, 59, 999);
                whereClause.fecha_creacion[Op.lte] = fechaFin;
            }
        }

        if (filterObj.ordenar_por === 'fecha_hoy') {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const mañana = new Date(hoy);
            mañana.setDate(mañana.getDate() + 1);
            whereClause.fecha_creacion = {
                [Op.gte]: hoy,
                [Op.lt]: mañana
            };
        }

        const includes = [];
        const bicicletaWhere = {};
        
        if (filterObj.bicicleta) {
            bicicletaWhere[Op.or] = [
                { bic_numero: { [Op.like]: `%${filterObj.bicicleta}%` } },
                { bic_id: isNaN(filterObj.bicicleta) ? null : parseInt(filterObj.bicicleta) }
            ];
        }

        if (filterObj.estacion_id) {
            bicicletaWhere.bic_estacion = filterObj.estacion_id;
        }

        if (filterObj.ordenar_por === 'bicicletas_taller') {
            bicicletaWhere.bic_estado = {
                [Op.in]: ['EN_MANTENIMIENTO', 'EN TALLER', 'REPARACION', 'REVISION']
            };
        }

        includes.push({
            model: bicicletasModels,
            where: Object.keys(bicicletaWhere).length > 0 ? bicicletaWhere : undefined,
            attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado']
        });

        includes.push({
            model: usuarioModels,
            as: 'operario',
            attributes: ['usu_documento', 'usu_nombre']
        });

        let orderBy = [['fecha_creacion', 'DESC']];
        if (filterObj.ordenar_por) {
            switch(filterObj.ordenar_por) {
                case 'fecha_creacion_asc':
                    orderBy = [['fecha_creacion', 'ASC']];
                    break;
                case 'pendientes_primero':
                    orderBy = [[sequelize.literal("CASE WHEN estado = 'pendiente' THEN 0 ELSE 1 END"), 'ASC'], ['fecha_creacion', 'DESC']];
                    break;
                case 'en_proceso_primero':
                    orderBy = [[sequelize.literal("CASE WHEN estado = 'en_proceso' THEN 0 ELSE 1 END"), 'ASC'], ['fecha_creacion', 'DESC']];
                    break;
            }
        }

        const { count, rows } = await mantenimientoModels.findAndCountAll({
            where: whereClause,
            include: includes,
            limit,
            offset,
            order: orderBy,
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
        console.error(error);
        handleHttpError(res, "ERROR_GET_MANTENIMIENTOS_POR_OPERARIO");
    }
};

const getComponentesConCategorias = async (req, res) => {
    try {
      // Obtenemos todas las categorías
      const categorias = await categoriaComponenteModels.findAll({
        attributes: ['cat_id', 'cat_nombre', 'cat_descripcion']
      });
      
      // Obtenemos todos los componentes con sus categorías
      const componentes = await componenteModels.findAll({
        attributes: ['comp_id', 'comp_nombre', 'categoria_id'],
        include: [{
          model: categoriaComponenteModels,
          attributes: ['cat_id', 'cat_nombre']
        }]
      });
      
      // Devolvemos ambos datos
      res.send({ 
        categorias: categorias,
        componentes: componentes
      });
    } catch (error) {
      console.error(error);
      handleHttpError(res, "ERROR_GET_COMPONENTES_CATEGORIAS");
    }
  };

/**
 * Crear nuevo mantenimiento
 */
const crearMantenimiento = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const body = matchedData(req);
        
        const { diagnostico_componentes, ...mantenimientoData } = body;
        
        // Asegurar que estacion_id sea número
        if (mantenimientoData.estacion_id !== undefined && mantenimientoData.estacion_id !== null) {
            // Convertir explícitamente a entero
            mantenimientoData.estacion_id = parseInt(mantenimientoData.estacion_id, 10);
            
            // Verificar si la conversión fue exitosa
            if (isNaN(mantenimientoData.estacion_id)) {
                throw new Error("estacion_id no es un número válido");
            }
        }
        
        // Si no hay prioridad, establecer media como valor por defecto
        if (!mantenimientoData.prioridad) {
            mantenimientoData.prioridad = 'media';
        }
        
        const mantenimientoCreado = await mantenimientoModels.create(mantenimientoData, { transaction });
        
        if (diagnostico_componentes && diagnostico_componentes.length > 0) {
            const historialRegistros = [];
            
            for (const componente of diagnostico_componentes) {
                const historialItem = {
                    mantenimiento_id: mantenimientoCreado.id,
                    componente_id: componente.componente_id,
                    estado_anterior: 'ok',
                    estado_nuevo: componente.estado,
                    accion_realizada: 'diagnóstico',
                    comentario: componente.comentario || '',
                    operario_id: mantenimientoData.operario_id
                };
                historialRegistros.push(historialItem);
                
                await estadoComponenteModels.upsert({
                    bicicleta_id: mantenimientoData.bicicleta_id,
                    componente_id: componente.componente_id,
                    estado: componente.estado
                }, { transaction });
            }
            
            if (historialRegistros.length > 0) {
                await historialMantenimientoModels.bulkCreate(historialRegistros, { transaction });
            }
        }
        
        // Si el estado es finalizado, establecer fecha de finalización
        if (mantenimientoData.estado === 'finalizado') {
            await mantenimientoCreado.update({ 
                fecha_finalizacion: new Date() 
            }, { transaction });
        }
        
        await transaction.commit();
        
        const dataCompleta = await mantenimientoModels.findByPk(mantenimientoCreado.id, {
            include: [
                {
                    model: historialMantenimientoModels,
                    include: [
                        {
                            model: componenteModels,
                            attributes: ['comp_id', 'comp_nombre', 'categoria_id']
                        }
                    ]
                }
            ]
        });
        
        res.status(201).send({ data: dataCompleta });
    } catch (error) {
        await transaction.rollback();
        console.error("Backend ERROR:", error);
        handleHttpError(res, "ERROR_CREAR_MANTENIMIENTO");
    }
};

/**
 * Finalizar mantenimiento
 */
const finalizarMantenimiento = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { id, comentarios } = matchedData(req);
      
      const mantenimiento = await mantenimientoModels.findByPk(id, {
        include: [
          {
            model: bicicletasModels,
            attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado']
          },
          {
            model: historialMantenimientoModels,
            include: [
              {
                model: componenteModels,
                attributes: ['comp_id', 'comp_nombre', 'categoria_id']
              }
            ]
          }
        ]
      });
      
      if (!mantenimiento) {
        await transaction.rollback();
        return res.status(404).send({ error: "MANTENIMIENTO_NO_ENCONTRADO" });
      }
      
      if (mantenimiento.estado === 'finalizado') {
        await transaction.rollback();
        return res.status(400).send({ error: "MANTENIMIENTO_YA_FINALIZADO" });
      }
      
      const historialComponentesConProblemas = mantenimiento.bc_historial_mantenimientos || [];
      
      const nuevosRegistrosHistorial = [];
      
      for (const historial of historialComponentesConProblemas) {
        if (historial.estado_nuevo !== 'ok') {
          nuevosRegistrosHistorial.push({
            mantenimiento_id: mantenimiento.id,
            componente_id: historial.componente_id,
            estado_anterior: historial.estado_nuevo,
            estado_nuevo: 'ok',
            accion_realizada: 'reparación',
            comentario: ``,
            operario_id: mantenimiento.operario_id,
            fecha_registro: new Date()
          });
          
          await estadoComponenteModels.upsert({
            bicicleta_id: mantenimiento.bicicleta_id,
            componente_id: historial.componente_id,
            estado: 'ok'
          }, { transaction });
        }
      }
      
      if (nuevosRegistrosHistorial.length > 0) {
        await historialMantenimientoModels.bulkCreate(nuevosRegistrosHistorial, { transaction });
      }
      
      await mantenimiento.update(
        {
          estado: 'finalizado',
          fecha_finalizacion: new Date(),
          comentarios: comentarios || mantenimiento.comentarios
        },
        { transaction }
      );
      
      if (mantenimiento.bicicleta_id && mantenimiento.bc_bicicleta) {
        const estadoActualBicicleta = mantenimiento.bc_bicicleta.bic_estado;
        const estadosEspeciales = ['PRESTADA', 'PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA'];
        
        if (!estadosEspeciales.includes(estadoActualBicicleta)) {
          await bicicletasModels.update(
            { bic_estado: 'DISPONIBLE' },
            { 
              where: { bic_id: mantenimiento.bicicleta_id },
              transaction 
            }
          );
        }
      }
      
      await transaction.commit();
      
      const dataFinalizada = await mantenimientoModels.findByPk(id, {
        include: [
          {
            model: bicicletasModels,
            attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado']
          },
          {
            model: historialMantenimientoModels,
            include: [
              {
                model: componenteModels,
                attributes: ['comp_id', 'comp_nombre', 'categoria_id']
              }
            ]
          }
        ]
      });
      
      res.send({ data: dataFinalizada });
    } catch (error) {
      await transaction.rollback();
      console.error("Error al finalizar mantenimiento:", error);
      res.status(500).send({ error: "ERROR_FINALIZAR_MANTENIMIENTO" });
    }
};

/**
 * Cancelar mantenimiento
 */
const cancelarMantenimiento = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = matchedData(req);
        
        const mantenimiento = await mantenimientoModels.findByPk(id);
        if (!mantenimiento) {
            await transaction.rollback();
            return res.status(404).send({ error: "MANTENIMIENTO_NO_ENCONTRADO" });
        }
        
        if (mantenimiento.estado === 'cancelado') {
            await transaction.rollback();
            return res.status(400).send({ error: "MANTENIMIENTO_YA_CANCELADO" });
        }
        
        if (mantenimiento.estado === 'finalizado') {
            await transaction.rollback();
            return res.status(400).send({ error: "NO_SE_PUEDE_CANCELAR_MANTENIMIENTO_FINALIZADO" });
        }
        
        // Cancelar el mantenimiento
        await mantenimiento.update(
            {
                estado: 'cancelado'
            },
            { transaction }
        );
        
        await transaction.commit();
        
        res.send({ data: { id, message: "Mantenimiento cancelado correctamente" } });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).send({ error: "ERROR_CANCELAR_MANTENIMIENTO" });
    }
};

/**
 * Crear múltiples mantenimientos
 */
const crearMantenimientosMasivo = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { mantenimientos } = req.body;
      
      const resultados = [];
      
      for (const mantenimientoItem of mantenimientos) {
        const { diagnostico_componentes, ...mantenimientoData } = mantenimientoItem;
        
        if (mantenimientoData.estacion_id !== undefined && mantenimientoData.estacion_id !== null) {
          mantenimientoData.estacion_id = parseInt(mantenimientoData.estacion_id, 10);
        }
        
        if (!mantenimientoData.prioridad) {
            mantenimientoData.prioridad = 'media';
        }
        
        const mantenimientoCreado = await mantenimientoModels.create(mantenimientoData, { transaction });
        
        if (diagnostico_componentes && diagnostico_componentes.length > 0) {
          const historialRegistros = [];
          
          for (const componente of diagnostico_componentes) {
            const historialItem = {
              mantenimiento_id: mantenimientoCreado.id,
              componente_id: componente.componente_id,
              estado_anterior: 'ok',
              estado_nuevo: componente.estado,
              accion_realizada: 'diagnóstico',
              comentario: componente.comentario || '',
              operario_id: mantenimientoData.operario_id
            };
            historialRegistros.push(historialItem);
            
            await estadoComponenteModels.upsert({
              bicicleta_id: mantenimientoData.bicicleta_id,
              componente_id: componente.componente_id,
              estado: componente.estado
            }, { transaction });
          }
          
          if (historialRegistros.length > 0) {
            await historialMantenimientoModels.bulkCreate(historialRegistros, { transaction });
          }
        }
        
        // Finalizar si es necesario
        if (mantenimientoData.estado === 'finalizado') {
          await mantenimientoCreado.update({ 
            fecha_finalizacion: new Date() 
          }, { transaction });
        }
        
        resultados.push(mantenimientoCreado.id);
      }
      
      await transaction.commit();
      
      res.status(201).send({ 
        message: `${resultados.length} mantenimientos creados correctamente`,
        ids: resultados 
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error en creación masiva:", error);
      handleHttpError(res, "ERROR_CREAR_MANTENIMIENTOS_MASIVO");
    }
};

const actualizarHistorialComponente = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { historial_id } = req.params;
        const { estado_nuevo, accion_realizada, comentario } = req.body;
        
        const historial = await historialMantenimientoModels.findByPk(historial_id, {
            include: [{
                model: mantenimientoModels,
                attributes: ['id', 'bicicleta_id']
            }]
        });
        
        if (!historial) {
            await transaction.rollback();
            return res.status(404).send({ error: "HISTORIAL_NO_ENCONTRADO" });
        }

        if (estado_nuevo === 'ok') {
            const bicicletaId = historial.bc_mantenimiento.bicicleta_id;
            const componenteId = historial.componente_id;
            
            await historial.destroy({ transaction });
            
            await estadoComponenteModels.destroy({
                where: {
                    bicicleta_id: bicicletaId,
                    componente_id: componenteId
                },
                transaction
            });
            
            await transaction.commit();
            
            return res.send({ 
                message: "Registro eliminado",
                deleted: true,
                historial_id: historial_id
            });
        }
        
        await historial.update({
            estado_nuevo,
            accion_realizada,
            comentario: comentario || null,
            fecha_revision: new Date()
        }, { transaction });
        
        await estadoComponenteModels.upsert({
            bicicleta_id: historial.bc_mantenimiento.bicicleta_id,
            componente_id: historial.componente_id,
            estado: estado_nuevo
        }, { transaction });
        
        await transaction.commit();
        
        const historialActualizado = await historialMantenimientoModels.findByPk(historial_id, {
            include: [{
                model: componenteModels,
                attributes: ['comp_id', 'comp_nombre', 'categoria_id']
            }]
        });
        
        res.send({ data: historialActualizado });
    } catch (error) {
        await transaction.rollback();
        console.error("Error al actualizar historial:", error);
        res.status(500).send({ error: "ERROR_ACTUALIZAR_HISTORIAL" });
    }
};

const crearHistorialComponente = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const body = matchedData(req);
      
      // Crear un nuevo registro de historial
      const nuevoHistorial = await historialMantenimientoModels.create({
        mantenimiento_id: body.mantenimiento_id,
        componente_id: body.componente_id,
        estado_anterior: body.estado_anterior,
        estado_nuevo: body.estado_nuevo,
        accion_realizada: body.accion_realizada,
        comentario: body.comentario,
        operario_id: body.operario_id,
        fecha_registro: new Date()
      }, { transaction });
      
      // Actualizar el estado del componente en la tabla de estados
      await estadoComponenteModels.upsert({
        bicicleta_id: body.bicicleta_id || (await mantenimientoModels.findByPk(body.mantenimiento_id)).bicicleta_id,
        componente_id: body.componente_id,
        estado: body.estado_nuevo
      }, { transaction });
      
      await transaction.commit();
      
      // Obtener el historial completo con las relaciones
      const historialCompleto = await historialMantenimientoModels.findByPk(nuevoHistorial.id, {
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
      });
      
      res.status(201).send({ data: historialCompleto });
    } catch (error) {
      await transaction.rollback();
      console.error("Error al crear historial de componente:", error);
      handleHttpError(res, "ERROR_CREAR_HISTORIAL_COMPONENTE");
    }
  };
  
const getRendimientoOperarios = async (req, res) => {
    try {
        // Obtener parámetros de query o body según el método HTTP
        const params = req.method === 'POST' ? req.body : req.query;
        
        const { fecha_inicio, fecha_fin, empresa_id, estacion_id } = params;
        
        if (!fecha_inicio || !fecha_fin) {
            return handleHttpError(res, "FECHAS_REQUERIDAS", 400);
        }
        
        let whereConditions = '';
        const replacements = {
            fecha_inicio: `${fecha_inicio} 00:00:00`, 
            fecha_fin: `${fecha_fin} 23:59:59`
        };
        
        if (empresa_id) {
            whereConditions += ' AND m.empresa_id = :empresa_id';
            replacements.empresa_id = empresa_id;
        }
        
        if (estacion_id) {
            whereConditions += ' AND m.estacion_id = :estacion_id';
            replacements.estacion_id = estacion_id;
        }
        
        const query = `
            SELECT 
                u.usu_documento AS operario_id,
                u.usu_nombre AS nombre_operario,
                COUNT(m.id) AS total_mantenimientos,
                SUM(CASE WHEN m.estado = 'finalizado' THEN 1 ELSE 0 END) AS mantenimientos_finalizados,
                SUM(CASE WHEN m.estado = 'en_proceso' THEN 1 ELSE 0 END) AS mantenimientos_en_proceso,
                SUM(CASE WHEN m.estado = 'pendiente' THEN 1 ELSE 0 END) AS mantenimientos_pendientes,
                COUNT(DISTINCT m.bicicleta_id) AS bicicletas_atendidas,
                GROUP_CONCAT(DISTINCT m.empresa_id) AS empresas_ids,
                AVG(CASE 
                    WHEN m.estado = 'finalizado' AND m.fecha_finalizacion IS NOT NULL 
                    THEN TIMESTAMPDIFF(HOUR, m.fecha_creacion, m.fecha_finalizacion) 
                    ELSE NULL 
                END) AS tiempo_promedio_horas,
                (
                    SELECT COUNT(h.id) 
                    FROM bc_historial_mantenimientos h
                    JOIN bc_mantenimientos m2 ON h.mantenimiento_id = m2.id
                    WHERE h.operario_id = u.usu_documento
                    AND h.fecha_registro BETWEEN :fecha_inicio AND :fecha_fin
                    ${empresa_id ? 'AND m2.empresa_id = :empresa_id' : ''}
                    ${estacion_id ? 'AND m2.estacion_id = :estacion_id' : ''}
                ) AS componentes_reparados,
                GROUP_CONCAT(DISTINCT m.estacion_id) AS estaciones_ids
            FROM bc_mantenimientos m
            JOIN bc_usuarios u ON m.operario_id = u.usu_documento
            WHERE m.fecha_creacion BETWEEN :fecha_inicio AND :fecha_fin ${whereConditions}
            GROUP BY u.usu_documento, u.usu_nombre
            HAVING total_mantenimientos > 0
            ORDER BY mantenimientos_finalizados DESC
        `;
        
        const rendimiento = await sequelize.query(query, { 
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT 
        });
        
        const rendimientoConFormato = rendimiento.map(op => {
            op.estaciones_ids = op.estaciones_ids ? op.estaciones_ids.split(',') : [];
            op.empresas_ids = op.empresas_ids ? op.empresas_ids.split(',') : [];
            
            // Asignar empresa_id si fue filtrado
            if (empresa_id) {
                op.empresa_id = empresa_id;
            } else if (op.empresas_ids && op.empresas_ids.length === 1) {
                op.empresa_id = op.empresas_ids[0];
            }
            
            // Calcular eficiencia
            op.eficiencia = op.total_mantenimientos > 0 
                ? ((op.mantenimientos_finalizados / op.total_mantenimientos) * 100).toFixed(2) 
                : "0.00";
                
            return op;
        });
        
        res.send({ 
            data: {
                periodo: { inicio: fecha_inicio, fin: fecha_fin },
                rendimiento: rendimientoConFormato
            } 
        });
    } catch (error) {
        console.error("Error al obtener rendimiento:", error);
        handleHttpError(res, "ERROR_GET_RENDIMIENTO_OPERARIOS");
    }
};

const getEstadisticasOperarios = async (req, res) => {
  try {
    let params = req.query;
    
    if (req.query.filter) {
      try {
        params = JSON.parse(req.query.filter);
      } catch (e) {
        console.error("Error al parsear filtros:", e);
      }
    }
    
    const { empresa_id, estacion_id, fecha_inicio, fecha_fin, operario_id } = params;
    
    // Definir la zona horaria local (Colombia es UTC-5)
    const zonaHoraria = '-05:00';
    
    let whereConditions = '';
    const replacements = {};
    
    if (empresa_id) {
      whereConditions += ' AND m.empresa_id = :empresa_id';
      replacements.empresa_id = empresa_id;
    }
    
    if (estacion_id) {
      whereConditions += ' AND m.estacion_id = :estacion_id';
      replacements.estacion_id = estacion_id;
    }
    
    // SOLUCIÓN FINAL PARA EL RANGO DE FECHAS
    if (fecha_inicio && fecha_fin) {
      // Si hay ambas fechas, usar el rango completo
      whereConditions += ` AND DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '${zonaHoraria}')) >= :fecha_inicio`;
      whereConditions += ` AND DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '${zonaHoraria}')) <= :fecha_fin`;
      replacements.fecha_inicio = fecha_inicio;
      replacements.fecha_fin = fecha_fin;
    } else if (fecha_inicio) {
      // Si solo hay fecha de inicio, traer desde esa fecha hasta hoy
      const fechaActual = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      whereConditions += ` AND DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '${zonaHoraria}')) >= :fecha_inicio`;
      replacements.fecha_inicio = fecha_inicio;
    }
    
    if (operario_id) {
      whereConditions += ' AND m.operario_id = :operario_id';
      replacements.operario_id = operario_id;
    }
    
    // Consulta principal con agrupación por operario y ajuste de zona horaria
    const query = `
      SELECT 
        u.usu_documento AS operario_id,
        u.usu_nombre AS nombre_operario,
        COUNT(m.id) AS total_mantenimientos,
        SUM(CASE WHEN m.estado = 'finalizado' THEN 1 ELSE 0 END) AS mantenimientos_finalizados,
        SUM(CASE WHEN m.estado = 'en_proceso' THEN 1 ELSE 0 END) AS mantenimientos_en_proceso,
        SUM(CASE WHEN m.estado = 'pendiente' THEN 1 ELSE 0 END) AS mantenimientos_pendientes,
        AVG(CASE WHEN m.estado = 'finalizado' AND m.fecha_finalizacion IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, m.fecha_creacion, m.fecha_finalizacion) 
          ELSE NULL END) AS tiempo_promedio_horas,
        COUNT(DISTINCT m.bicicleta_id) AS bicicletas_atendidas,
        GROUP_CONCAT(DISTINCT m.estacion_id) AS estaciones_ids,
        GROUP_CONCAT(DISTINCT m.empresa_id) AS empresas_ids
      FROM bc_mantenimientos m
      JOIN bc_usuarios u ON m.operario_id = u.usu_documento
      WHERE 1=1 ${whereConditions}
      GROUP BY u.usu_documento, u.usu_nombre
      HAVING total_mantenimientos > 0
    `;
    
    
    const estadisticas = await sequelize.query(query, { 
      replacements,
      type: sequelize.QueryTypes.SELECT 
    });
    
    
    res.send({ data: estadisticas });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send({ error: "ERROR_GET_ESTADISTICAS_OPERARIOS" });
  }
};

// Controlador para estadísticas por empresa - actualizado
const getEstadisticasOperariosByEmpresa = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { fecha_inicio, fecha_fin, operario_id } = req.query;
    
    if (!empresaId) {
      return handleHttpError(res, "EMPRESA_ID_REQUIRED", 400);
    }
    
    let whereConditions = ' AND m.empresa_id = :empresaId';
    const replacements = { empresaId };
    
    if (fecha_inicio) {
      whereConditions += ' AND DATE(m.fecha_creacion) >= DATE(:fecha_inicio)';
      replacements.fecha_inicio = fecha_inicio;
    }

    if (fecha_fin) {
      whereConditions += ' AND DATE(m.fecha_creacion) <= DATE(:fecha_fin)';
      replacements.fecha_fin = fecha_fin;
    }
    
    if (operario_id) {
      whereConditions += ' AND m.operario_id = :operario_id';
      replacements.operario_id = operario_id;
    }
    
    const query = `
      SELECT 
        u.usu_documento AS operario_id,
        u.usu_nombre AS nombre_operario,
        '${empresaId}' AS empresa_id,
        COUNT(m.id) AS total_mantenimientos,
        SUM(CASE WHEN m.estado = 'finalizado' THEN 1 ELSE 0 END) AS mantenimientos_finalizados,
        SUM(CASE WHEN m.estado = 'en_proceso' THEN 1 ELSE 0 END) AS mantenimientos_en_proceso,
        SUM(CASE WHEN m.estado = 'pendiente' THEN 1 ELSE 0 END) AS mantenimientos_pendientes,
        SUM(CASE WHEN m.estado = 'cancelado' THEN 1 ELSE 0 END) AS mantenimientos_cancelados,
        COUNT(DISTINCT m.bicicleta_id) AS bicicletas_atendidas,
        AVG(CASE 
          WHEN m.estado = 'finalizado' AND m.fecha_finalizacion IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, m.fecha_creacion, m.fecha_finalizacion) 
          ELSE NULL 
        END) AS tiempo_promedio_horas,
        GROUP_CONCAT(DISTINCT m.estacion_id) AS estaciones_ids
      FROM bc_mantenimientos m
      JOIN bc_usuarios u ON m.operario_id = u.usu_documento
      WHERE 1=1 ${whereConditions}
      GROUP BY u.usu_documento, u.usu_nombre
      HAVING total_mantenimientos > 0
      ORDER BY total_mantenimientos DESC
    `;
    
    const estadisticas = await sequelize.query(query, { 
      replacements,
      type: sequelize.QueryTypes.SELECT 
    });
    
    const estadisticasConEstaciones = estadisticas.map(item => {
      item.estaciones_ids = item.estaciones_ids ? item.estaciones_ids.split(',') : [];
      
      item.eficiencia = item.total_mantenimientos > 0
        ? ((item.mantenimientos_finalizados / item.total_mantenimientos) * 100).toFixed(2)
        : "0.00";
        
      return item;
    });
    
    res.send({ data: estadisticasConEstaciones });
  } catch (error) {
    console.error("Error al obtener estadísticas por empresa:", error);
    handleHttpError(res, "ERROR_GET_ESTADISTICAS_BY_EMPRESA");
  }
};

// Controlador para estadísticas por estación - actualizado
const getEstadisticasOperariosByEstacion = async (req, res) => {
  try {
    const { estacionId } = req.params;
    const { fecha_inicio, fecha_fin, operario_id } = req.query;
    
    
    const checkQuery = `SELECT COUNT(*) as total FROM bc_mantenimientos WHERE estacion_id = :estacionId`;
    const checkResult = await sequelize.query(checkQuery, { 
      replacements: { estacionId },
      type: sequelize.QueryTypes.SELECT 
    });
    
    let whereConditions = ' AND m.estacion_id = :estacionId';
    const replacements = { estacionId };
    
    if (fecha_inicio) {
      whereConditions += ' AND DATE(m.fecha_creacion) >= DATE(:fecha_inicio)';
      replacements.fecha_inicio = fecha_inicio;
    }
    
    if (fecha_fin) {
      whereConditions += ' AND DATE(m.fecha_creacion) <= DATE(:fecha_fin)';
      replacements.fecha_fin = fecha_fin;
    }
    
    if (operario_id) {
      whereConditions += ' AND m.operario_id = :operario_id';
      replacements.operario_id = operario_id;
    }
    
    // Consulta principal modificada para incluir todos los estados
    const query = `
      SELECT 
        u.usu_documento AS operario_id,
        u.usu_nombre AS nombre_operario,
        m.empresa_id AS empresa_id,
        m.estacion_id,
        COUNT(m.id) AS total_mantenimientos,
        SUM(CASE WHEN m.estado = 'finalizado' THEN 1 ELSE 0 END) AS mantenimientos_finalizados,
        SUM(CASE WHEN m.estado = 'en_proceso' THEN 1 ELSE 0 END) AS mantenimientos_en_proceso,
        SUM(CASE WHEN m.estado = 'pendiente' THEN 1 ELSE 0 END) AS mantenimientos_pendientes,
        SUM(CASE WHEN m.estado = 'cancelado' THEN 1 ELSE 0 END) AS mantenimientos_cancelados,
        COUNT(DISTINCT m.bicicleta_id) AS bicicletas_atendidas,
        AVG(CASE WHEN m.estado = 'finalizado' AND m.fecha_finalizacion IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, m.fecha_creacion, m.fecha_finalizacion) 
            ELSE NULL END) AS tiempo_promedio_horas
      FROM bc_mantenimientos m
      JOIN bc_usuarios u ON m.operario_id = u.usu_documento
      WHERE 1=1 ${whereConditions}
      GROUP BY u.usu_documento, u.usu_nombre, m.empresa_id, m.estacion_id
      HAVING total_mantenimientos > 0
    `;
    
    const estadisticas = await sequelize.query(query, { 
      replacements,
      type: sequelize.QueryTypes.SELECT 
    });
    
    // Calcular eficiencia y otras métricas
    const estadisticasEnriquecidas = estadisticas.map(item => {
      // Añadir eficiencia
      item.eficiencia = item.total_mantenimientos > 0
        ? ((item.mantenimientos_finalizados / item.total_mantenimientos) * 100).toFixed(2)
        : "0.00";
      
      return item;
    });
    
    // Devolver los resultados enriquecidos
    res.send({ data: estadisticasEnriquecidas });
  } catch (error) {
    console.error("Error en estadísticas por estación:", error);
    res.status(500).send({ 
      error: "ERROR_GET_ESTADISTICAS_BY_ESTACION",
      message: error.message 
    });
  }

  
};


const getComponentesPorBicicleta = async (req, res) => {
    try {
        const { bicicleta_id } = matchedData(req);
        
        const componentes = await componenteModels.findAll({
            attributes: ['comp_id', 'comp_nombre', 'categoria_id']
        });

        const historialesRecientes = await historialMantenimientoModels.findAll({
            attributes: [
                'componente_id',
                [sequelize.fn('MAX', sequelize.col('bc_historial_mantenimientos.id')), 'max_id']
            ],
            include: [
                {
                    model: mantenimientoModels,
                    where: { bicicleta_id },
                    attributes: []
                }
            ],
            group: ['componente_id'],
            raw: true
        });

        const historialIds = historialesRecientes.map(h => h.max_id).filter(id => id);

        const historiales = historialIds.length > 0 
            ? await historialMantenimientoModels.findAll({
                where: { id: { [Op.in]: historialIds } },
                attributes: ['componente_id', 'estado_nuevo']
            })
            : [];

        const historialMap = new Map(
            historiales.map(h => [h.componente_id, h.estado_nuevo])
        );

        const componentesConEstado = componentes.map(componente => ({
            comp_id: componente.comp_id,
            comp_nombre: componente.comp_nombre,
            categoria_id: componente.categoria_id,
            estado_actual: historialMap.get(componente.comp_id) || 'ok'
        }));

        res.send({ data: componentesConEstado });
            
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "ERROR_GET_COMPONENTES_BICICLETA" });
    }
};
const trasladoMasivoMantenimientos = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { operario_origen, operario_destino } = matchedData(req);
        
        const mantenimientosPendientes = await mantenimientoModels.findAll({
            where: { 
                operario_id: operario_origen,
                estado: 'pendiente'
            },
            transaction
        });

        if (mantenimientosPendientes.length === 0) {
            await transaction.rollback();
            return res.status(404).send({ 
                error: "No se encontraron mantenimientos pendientes para este operario" 
            });
        }

        const mantenimientoIds = mantenimientosPendientes.map(m => m.id);

        // Actualizar mantenimientos
        await mantenimientoModels.update(
            { operario_id: operario_destino },
            { 
                where: { 
                    operario_id: operario_origen,
                    estado: 'pendiente'
                },
                transaction
            }
        );

        // Actualizar historial
        await historialMantenimientoModels.update(
            { operario_id: operario_destino },
            {
                where: {
                    mantenimiento_id: {
                        [Op.in]: mantenimientoIds
                    }
                },
                transaction
            }
        );

        await transaction.commit();

        const cantidadTrasladados = mantenimientosPendientes.length;
        
        res.send({ 
            success: true,
            message: `Se trasladaron ${cantidadTrasladados} mantenimientos pendientes (incluyendo historial)`,
            cantidad: cantidadTrasladados
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        handleHttpError(res, "ERROR_TRASLADO_MASIVO_MANTENIMIENTOS");
    }
};


const getHistorialMantenimiento = async (req, res) => {
    try {
        const { mantenimiento_id } = matchedData(req);
        
        const data = await historialMantenimientoModels.findAll({
            where: { mantenimiento_id },
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
            ],
            order: [['fecha_registro', 'DESC']]
        });
        
        res.send({ data });
    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_GET_HISTORIAL");
    }
};

//Exportaciones
const exportMantenimientosPorEmpresa = async (req, res) => {
    try {
        const { empresa_id } = matchedData(req);
        const whereClause = { empresa_id };
        const filterObj = req.query.filter ? JSON.parse(req.query.filter) : req.query;
        
        if (filterObj.operario_id) whereClause.operario_id = filterObj.operario_id;
        if (filterObj.estado && filterObj.estado !== 'todos') whereClause.estado = filterObj.estado;
        if (filterObj.prioridad && filterObj.prioridad !== 'todos') whereClause.prioridad = filterObj.prioridad;
        if (filterObj.tipo && filterObj.tipo !== 'todos') whereClause.tipo_mantenimiento = filterObj.tipo;
        
        if (filterObj.fecha_inicio || filterObj.fecha_fin) {
            whereClause.fecha_creacion = {};
            if (filterObj.fecha_inicio) whereClause.fecha_creacion[Op.gte] = new Date(filterObj.fecha_inicio);
            if (filterObj.fecha_fin) {
                const fechaFin = new Date(filterObj.fecha_fin);
                fechaFin.setHours(23, 59, 59, 999);
                whereClause.fecha_creacion[Op.lte] = fechaFin;
            }
        }

        if (filterObj.ordenar_por === 'fecha_hoy') {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const mañana = new Date(hoy);
            mañana.setDate(mañana.getDate() + 1);
            whereClause.fecha_creacion = {
                [Op.gte]: hoy,
                [Op.lt]: mañana
            };
        }

        const bicicletaWhere = {};
        if (filterObj.bicicleta) {
            bicicletaWhere[Op.or] = [
                { bic_numero: { [Op.like]: `%${filterObj.bicicleta}%` } },
                { bic_id: isNaN(filterObj.bicicleta) ? null : parseInt(filterObj.bicicleta) }
            ];
        }

        if (filterObj.ordenar_por === 'bicicletas_taller') {
            bicicletaWhere.bic_estado = {
                [Op.in]: ['EN_MANTENIMIENTO', 'EN TALLER', 'REPARACION', 'REVISION']
            };
        }

        let orderBy = [['fecha_creacion', 'DESC']];
        if (filterObj.ordenar_por) {
            switch(filterObj.ordenar_por) {
                case 'fecha_creacion_asc':
                    orderBy = [['fecha_creacion', 'ASC']];
                    break;
                case 'pendientes_primero':
                    orderBy = [[sequelize.literal("CASE WHEN estado = 'pendiente' THEN 0 ELSE 1 END"), 'ASC'], ['fecha_creacion', 'DESC']];
                    break;
                case 'en_proceso_primero':
                    orderBy = [[sequelize.literal("CASE WHEN estado = 'en_proceso' THEN 0 ELSE 1 END"), 'ASC'], ['fecha_creacion', 'DESC']];
                    break;
            }
        }

        const data = await mantenimientoModels.findAll({
            where: whereClause,
            include: [
                {
                    model: bicicletasModels,
                    where: Object.keys(bicicletaWhere).length > 0 ? bicicletaWhere : undefined,
                    attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado']
                },
                {
                    model: usuarioModels,
                    as: 'operario',
                    attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_ciudad']
                }
            ],
            order: orderBy
        });
        
        res.send({ data });
    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_EXPORT_MANTENIMIENTOS_POR_EMPRESA");
    }
};

const exportMantenimientosPorEstacion = async (req, res) => {
    try {
        const { estacion_id } = matchedData(req);
        const whereClause = {};
        const filterObj = req.query.filter ? JSON.parse(req.query.filter) : req.query;
        
        if (filterObj.operario_id) whereClause.operario_id = filterObj.operario_id;
        if (filterObj.estado && filterObj.estado !== 'todos') whereClause.estado = filterObj.estado;
        if (filterObj.prioridad && filterObj.prioridad !== 'todos') whereClause.prioridad = filterObj.prioridad;
        
        if (filterObj.fecha_inicio || filterObj.fecha_fin) {
            whereClause.fecha_creacion = {};
            if (filterObj.fecha_inicio) whereClause.fecha_creacion[Op.gte] = new Date(filterObj.fecha_inicio);
            if (filterObj.fecha_fin) {
                const fechaFin = new Date(filterObj.fecha_fin);
                fechaFin.setHours(23, 59, 59, 999);
                whereClause.fecha_creacion[Op.lte] = fechaFin;
            }
        }

        if (filterObj.ordenar_por === 'fecha_hoy') {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const mañana = new Date(hoy);
            mañana.setDate(mañana.getDate() + 1);
            whereClause.fecha_creacion = {
                [Op.gte]: hoy,
                [Op.lt]: mañana
            };
        }

        const bicicletaWhere = { bic_estacion: estacion_id };
        
        if (filterObj.bicicleta) {
            bicicletaWhere[Op.or] = [
                { bic_numero: { [Op.like]: `%${filterObj.bicicleta}%` } },
                { bic_id: isNaN(filterObj.bicicleta) ? null : parseInt(filterObj.bicicleta) }
            ];
        }

        if (filterObj.ordenar_por === 'bicicletas_taller') {
            bicicletaWhere.bic_estado = {
                [Op.in]: ['EN_MANTENIMIENTO', 'EN TALLER', 'REPARACION', 'REVISION']
            };
        }

        let orderBy = [['fecha_creacion', 'DESC']];
        if (filterObj.ordenar_por) {
            switch(filterObj.ordenar_por) {
                case 'fecha_creacion_asc':
                    orderBy = [['fecha_creacion', 'ASC']];
                    break;
                case 'pendientes_primero':
                    orderBy = [[sequelize.literal("CASE WHEN estado = 'pendiente' THEN 0 ELSE 1 END"), 'ASC'], ['fecha_creacion', 'DESC']];
                    break;
                case 'en_proceso_primero':
                    orderBy = [[sequelize.literal("CASE WHEN estado = 'en_proceso' THEN 0 ELSE 1 END"), 'ASC'], ['fecha_creacion', 'DESC']];
                    break;
            }
        }

        const data = await mantenimientoModels.findAll({
            where: whereClause,
            include: [
                {
                    model: bicicletasModels,
                    where: bicicletaWhere,
                    attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado']
                },
                {
                    model: usuarioModels,
                    as: 'operario',
                    attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_ciudad']
                }
            ],
            order: orderBy
        });
        
        res.send({ data });
    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_EXPORT_MANTENIMIENTOS_POR_ESTACION");
    }
};

module.exports = {
    getMantenimientos,
    getMantenimientoPorId,
    getMantenimientosPorEstacion,
    getMantenimientosPorEmpresa,
    getMantenimientosPorBicicleta,
    crearMantenimiento,
    actualizarMantenimiento,
    finalizarMantenimiento,
    cancelarMantenimiento,
    getMantenimientosPorOperario,
    getComponentesConCategorias,
    crearMantenimientosMasivo,
    actualizarHistorialComponente,
    crearHistorialComponente,
    getEstadisticasOperarios,
    getRendimientoOperarios,
    getEstadisticasOperariosByEmpresa,
    getEstadisticasOperariosByEstacion,
    getComponentesPorBicicleta,
    trasladoMasivoMantenimientos,
    getHistorialMantenimiento,
    exportMantenimientosPorEmpresa,
    exportMantenimientosPorEstacion
};