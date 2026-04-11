// controllers/mantenimientos.js
const { sequelize } = require("../config/mysql");
const { bicicletasModels, componenteModels, estadoComponenteModels, historialMantenimientoModels, categoriaComponenteModels, agendamientoOperarioModels, estacionModels } = require("../models");
const { matchedData } = require("express-validator");
const { mantenimientoModels } = require("../models");
const { usuarioModels } = require("../models");
const { Op, QueryTypes } = require('sequelize');
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
                [Op.lt]: mañana,
            };
        }

        const bicicletaWhere = {};
        let hasBicicletaFilter = false;

        const rawBicicletas = filterObj.bicicletas;
        let bicicletasSeleccionadas = [];
        if (rawBicicletas) {
            try {
                if (Array.isArray(rawBicicletas)) {
                    bicicletasSeleccionadas = rawBicicletas;
                } else if (typeof rawBicicletas === 'string') {
                    const trimmed = rawBicicletas.trim();
                    if (trimmed.startsWith('[')) {
                        bicicletasSeleccionadas = JSON.parse(trimmed);
                    } else {
                        bicicletasSeleccionadas = trimmed.split(',');
                    }
                }
            } catch (e) {
                bicicletasSeleccionadas = [];
            }

            bicicletasSeleccionadas = (bicicletasSeleccionadas || [])
                .map((x) => String(x).trim())
                .filter((x) => x !== '');

            if (bicicletasSeleccionadas.length > 0) {
                hasBicicletaFilter = true;
                bicicletaWhere.bic_numero = { [Op.in]: bicicletasSeleccionadas };
            }
        }

        if (!hasBicicletaFilter && filterObj.bicicleta) {
            hasBicicletaFilter = true;
            bicicletaWhere[Op.or] = [
                { bic_numero: { [Op.like]: `%${filterObj.bicicleta}%` } },
                { bic_id: isNaN(filterObj.bicicleta) ? null : parseInt(filterObj.bicicleta) },
            ];
        }

        if (filterObj.ordenar_por === 'bicicletas_taller') {
            bicicletaWhere.bic_estado = {
                [Op.in]: ['EN_MANTENIMIENTO', 'EN TALLER', 'REPARACION', 'REVISION'],
            };
        }

        let orderBy = [['fecha_creacion', 'DESC']];
        if (filterObj.ordenar_por) {
            switch (filterObj.ordenar_por) {
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

        const { rows, count } = await mantenimientoModels.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: bicicletasModels,
                    where: hasBicicletaFilter ? bicicletaWhere : undefined,
                    required: !!hasBicicletaFilter,
                    attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado'],
                },
                {
                    model: usuarioModels,
                    as: 'operario',
                    attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_ciudad'],
                },
            ],
            limit,
            offset,
            order: orderBy,
            distinct: true,
        });

        res.send({
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error(error);
        handleHttpError(res, 'ERROR_GET_MANTENIMIENTOS_POR_EMPRESA');
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
                [Op.lt]: mañana,
            };
        }

        const bicicletaWhere = { bic_estacion: estacion_id };

        const rawBicicletas = filterObj.bicicletas;
        let bicicletasSeleccionadas = [];
        if (rawBicicletas) {
            try {
                if (Array.isArray(rawBicicletas)) {
                    bicicletasSeleccionadas = rawBicicletas;
                } else if (typeof rawBicicletas === 'string') {
                    const trimmed = rawBicicletas.trim();
                    if (trimmed.startsWith('[')) {
                        bicicletasSeleccionadas = JSON.parse(trimmed);
                    } else {
                        bicicletasSeleccionadas = trimmed.split(',');
                    }
                }
            } catch (e) {
                bicicletasSeleccionadas = [];
            }
        }

        bicicletasSeleccionadas = (bicicletasSeleccionadas || [])
            .map((x) => String(x).trim())
            .filter((x) => x !== '');

        if (bicicletasSeleccionadas.length > 0) {
            bicicletaWhere.bic_numero = { [Op.in]: bicicletasSeleccionadas };
        } else if (filterObj.bicicleta) {
            bicicletaWhere[Op.or] = [
                { bic_numero: { [Op.like]: `%${filterObj.bicicleta}%` } },
                { bic_id: isNaN(filterObj.bicicleta) ? null : parseInt(filterObj.bicicleta) },
            ];
        }

        if (filterObj.ordenar_por === 'bicicletas_taller') {
            bicicletaWhere.bic_estado = {
                [Op.in]: ['EN_MANTENIMIENTO', 'EN TALLER', 'REPARACION', 'REVISION'],
            };
        }

        let orderBy = [['fecha_creacion', 'DESC']];
        if (filterObj.ordenar_por) {
            switch (filterObj.ordenar_por) {
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

        const { rows, count } = await mantenimientoModels.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: bicicletasModels,
                    where: bicicletaWhere,
                    required: true,
                    attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado'],
                },
                {
                    model: usuarioModels,
                    as: 'operario',
                    attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_ciudad'],
                },
            ],
            limit,
            offset,
            order: orderBy,
            distinct: true,
        });

        res.send({
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error(error);
        handleHttpError(res, 'ERROR_GET_MANTENIMIENTOS_POR_ESTACION');
    }
};

const getMantenimientosPorBicicleta = async (req, res) => {
    try {
        const { bicicleta_id } = matchedData(req);
        const data = await mantenimientoModels.findAll({
            where: { bicicleta_id },
            include: [
                {
                    model: bicicletasModels,
                    attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado'],
                },
                {
                    model: usuarioModels,
                    as: 'operario',
                    attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_ciudad'],
                },
            ],
            order: [['fecha_creacion', 'DESC']],
        });
        res.send({ data });
    } catch (error) {
        console.error(error);
        handleHttpError(res, 'ERROR_GET_MANTENIMIENTOS_POR_BICICLETA');
    }
};

const crearMantenimiento = async (req, res) => {
    try {
        const data = await mantenimientoModels.create(req.body || {});
        res.send({ data });
    } catch (error) {
        console.error(error);
        handleHttpError(res, 'ERROR_CREATE_MANTENIMIENTO');
    }
};

const actualizarMantenimiento = async (req, res) => {
    try {
        const { id } = matchedData(req);
        await mantenimientoModels.update(req.body || {}, { where: { id } });
        const data = await mantenimientoModels.findByPk(id);
        res.send({ data });
    } catch (error) {
        console.error(error);
        handleHttpError(res, 'ERROR_UPDATE_MANTENIMIENTO');
    }
};

const finalizarMantenimiento = async (req, res) => {
    try {
        const { id } = matchedData(req);
        await mantenimientoModels.update(
            { estado: 'finalizado', fecha_finalizacion: new Date() },
            { where: { id } },
        );
        const data = await mantenimientoModels.findByPk(id);
        res.send({ data });
    } catch (error) {
        console.error(error);
        handleHttpError(res, 'ERROR_FINALIZAR_MANTENIMIENTO');
    }
};

const cancelarMantenimiento = async (req, res) => {
    try {
        const { id } = matchedData(req);
        await mantenimientoModels.update({ estado: 'cancelado' }, { where: { id } });
        const data = await mantenimientoModels.findByPk(id);
        res.send({ data });
    } catch (error) {
        console.error(error);
        handleHttpError(res, 'ERROR_CANCELAR_MANTENIMIENTO');
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

        const { rows, count } = await mantenimientoModels.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: bicicletasModels,
                    attributes: ['bic_id', 'bic_numero', 'bic_estacion', 'bic_estado'],
                },
                {
                    model: usuarioModels,
                    as: 'operario',
                    attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_ciudad'],
                },
            ],
            limit,
            offset,
            order: [['fecha_creacion', 'DESC']],
            distinct: true,
        });

        res.send({
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error(error);
        handleHttpError(res, 'ERROR_GET_MANTENIMIENTOS_POR_OPERARIO');
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

    const zonaHoraria = "-05:00";

    let whereConditions = "";
    const replacements = {};

    if (empresa_id) {
      whereConditions += " AND m.empresa_id = :empresa_id";
      replacements.empresa_id = empresa_id;
    }

    if (estacion_id) {
      whereConditions += " AND m.estacion_id = :estacion_id";
      replacements.estacion_id = estacion_id;
    }

    if (fecha_inicio && fecha_fin) {
      whereConditions += ` AND DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '${zonaHoraria}')) >= :fecha_inicio`;
      whereConditions += ` AND DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '${zonaHoraria}')) <= :fecha_fin`;
      replacements.fecha_inicio = fecha_inicio;
      replacements.fecha_fin = fecha_fin;
    } else if (fecha_inicio) {
      whereConditions += ` AND DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '${zonaHoraria}')) >= :fecha_inicio`;
      replacements.fecha_inicio = fecha_inicio;
    }

    if (operario_id) {
      whereConditions += " AND m.operario_id = :operario_id";
      replacements.operario_id = operario_id;
    }

    const query = `
      SELECT 
        u.usu_documento AS operario_id,
        u.usu_nombre AS nombre_operario,
        COUNT(m.id) AS total_mantenimientos,
        SUM(CASE WHEN m.estado = 'finalizado' THEN 1 ELSE 0 END) AS mantenimientos_finalizados,
        SUM(CASE WHEN m.estado = 'en_proceso' THEN 1 ELSE 0 END) AS mantenimientos_en_proceso,
        SUM(CASE WHEN m.estado = 'pendiente' THEN 1 ELSE 0 END) AS mantenimientos_pendientes,
        AVG(CASE 
          WHEN m.estado = 'finalizado' AND m.fecha_finalizacion IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, m.fecha_creacion, m.fecha_finalizacion) 
          ELSE NULL 
        END) AS tiempo_promedio_horas,
        COUNT(DISTINCT m.bicicleta_id) AS bicicletas_atendidas,
        GROUP_CONCAT(DISTINCT m.estacion_id) AS estaciones_ids,
        GROUP_CONCAT(DISTINCT m.empresa_id) AS empresas_ids,
        ec.empresas_conteo AS empresas_conteo
      FROM bc_mantenimientos m
      JOIN bc_usuarios u ON m.operario_id = u.usu_documento
      LEFT JOIN (
        SELECT 
          x.operario_id,
          GROUP_CONCAT(CONCAT(x.empresa_id, ':', x.cnt) SEPARATOR ',') AS empresas_conteo
        FROM (
          SELECT 
            m2.operario_id,
            m2.empresa_id,
            COUNT(m2.id) AS cnt
          FROM bc_mantenimientos m2
          WHERE 1=1 ${whereConditions}
          GROUP BY m2.operario_id, m2.empresa_id
        ) x
        GROUP BY x.operario_id
      ) ec ON ec.operario_id = u.usu_documento
      WHERE 1=1 ${whereConditions}
      GROUP BY u.usu_documento, u.usu_nombre, ec.empresas_conteo
      HAVING total_mantenimientos > 0
    `;

    const estadisticas = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const estadisticasConEstaciones = estadisticas.map((item) => {
      item.estaciones_ids = item.estaciones_ids ? item.estaciones_ids.split(",") : [];
      item.empresas_ids = item.empresas_ids ? String(item.empresas_ids) : "";
      item.empresas_conteo = item.empresas_conteo ? String(item.empresas_conteo) : "";

      item.eficiencia =
        item.total_mantenimientos > 0
          ? ((item.mantenimientos_finalizados / item.total_mantenimientos) * 100).toFixed(2)
          : "0.00";

      return item;
    });

    const empresasSet = new Set();
    const estacionesSet = new Set();

    (estadisticasConEstaciones || []).forEach((it) => {
      const empresasRaw = it && it.empresas_ids ? String(it.empresas_ids) : "";
      const empresasIds = empresasRaw
        ? empresasRaw
            .split(",")
            .map((x) => String(x).trim())
            .filter((x) => x !== "")
        : [];
      empresasIds.forEach((x) => empresasSet.add(x));

      const empresasConteoRaw = it && it.empresas_conteo ? String(it.empresas_conteo) : "";
      const empresasConteo = empresasConteoRaw
        ? empresasConteoRaw
            .split(",")
            .map((p) => String(p).trim())
            .filter((p) => p !== "")
        : [];
      empresasConteo.forEach((pair) => {
        const idx = pair.indexOf(":");
        if (idx <= 0) return;
        const k = String(pair.substring(0, idx)).trim();
        if (k) empresasSet.add(k);
      });

      const estacionesIds = Array.isArray(it && it.estaciones_ids) ? it.estaciones_ids : [];
      estacionesIds
        .map((x) => String(x).trim())
        .filter((x) => x !== "")
        .forEach((x) => estacionesSet.add(x));
    });

    const empresasIdsUnique = Array.from(empresasSet);
    const estacionesIdsUnique = Array.from(estacionesSet);

    let empresasCatalogo = [];
    let estacionesCatalogo = [];

    if (empresasIdsUnique.length > 0) {
      empresasCatalogo = await sequelize.query(
        `SELECT emp_id AS id, emp_nombre AS nombre
         FROM bc_empresas
         WHERE emp_id IN (:empresaKeys) OR emp_nombre IN (:empresaKeys)` ,
        {
          replacements: { empresaKeys: empresasIdsUnique },
          type: QueryTypes.SELECT,
        },
      );
    }

    if (estacionesIdsUnique.length > 0) {
      estacionesCatalogo = await sequelize.query(
        `SELECT est_id AS id, est_estacion AS nombre FROM bc_estaciones WHERE est_id IN (:estacionIds)` ,
        {
          replacements: { estacionIds: estacionesIdsUnique },
          type: QueryTypes.SELECT,
        },
      );
    }

    const empresasMap = new Map();
    (empresasCatalogo || []).forEach((e) => {
      if (!e) return;
      const idKey = e.id === null || e.id === undefined ? "" : String(e.id);
      const nombreKey = e.nombre === null || e.nombre === undefined ? "" : String(e.nombre);
      if (idKey) empresasMap.set(idKey, e);
      if (nombreKey) empresasMap.set(nombreKey, e);
    });

    const estacionesMap = new Map((estacionesCatalogo || []).map((s) => [String(s.id), s]));

    const dataFinal = (estadisticasConEstaciones || []).map((it) => {
      const empresasRaw = it && it.empresas_ids ? String(it.empresas_ids) : "";
      const empresasIds = empresasRaw
        ? empresasRaw
            .split(",")
            .map((x) => String(x).trim())
            .filter((x) => x !== "")
        : [];
      const estacionesIds = Array.isArray(it && it.estaciones_ids) ? it.estaciones_ids : [];

      const empresasDetalle = empresasIds.map((id) => {
        const found = empresasMap.get(String(id));
        return {
          id: String(id),
          nombre: found && found.nombre ? String(found.nombre) : null,
        };
      });

      const estacionesDetalle = estacionesIds
        .map((x) => String(x).trim())
        .filter((x) => x !== "")
        .map((id) => {
          const found = estacionesMap.get(String(id));
          return {
            id: String(id),
            nombre: found && found.nombre ? String(found.nombre) : null,
          };
        });

      return {
        ...it,
        empresas_detalle: empresasDetalle,
        estaciones_detalle: estacionesDetalle,
      };
    });

    res.send({ data: dataFinal });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send({ error: "ERROR_GET_ESTADISTICAS_OPERARIOS" });
  }
};

const getRendimientoOperarios = async (req, res) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const { fecha_inicio, fecha_fin, empresa_id, estacion_id } = params;

    if (!fecha_inicio || !fecha_fin) {
      return handleHttpError(res, "FECHAS_REQUERIDAS", 400);
    }

    let whereConditions = '';
    const replacements = {
      fecha_inicio: `${fecha_inicio} 00:00:00`,
      fecha_fin: `${fecha_fin} 23:59:59`,
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
      type: sequelize.QueryTypes.SELECT,
    });

    const rendimientoConFormato = rendimiento.map((op) => {
      op.estaciones_ids = op.estaciones_ids ? op.estaciones_ids.split(',') : [];
      op.empresas_ids = op.empresas_ids ? op.empresas_ids.split(',') : [];

      if (empresa_id) {
        op.empresa_id = empresa_id;
      } else if (op.empresas_ids && op.empresas_ids.length === 1) {
        op.empresa_id = op.empresas_ids[0];
      }

      op.eficiencia =
        op.total_mantenimientos > 0
          ? ((op.mantenimientos_finalizados / op.total_mantenimientos) * 100).toFixed(2)
          : "0.00";

      return op;
    });

    res.send({
      data: {
        periodo: { inicio: fecha_inicio, fin: fecha_fin },
        rendimiento: rendimientoConFormato,
      },
    });
  } catch (error) {
    console.error("Error al obtener rendimiento:", error);
    handleHttpError(res, "ERROR_GET_RENDIMIENTO_OPERARIOS");
  }
};

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
    
    const whereConditionsM3 = String(whereConditions || "").replace(/\bm\./g, "m3.");
    
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
        GROUP_CONCAT(DISTINCT m.estacion_id) AS estaciones_ids,
        sc.estaciones_conteo AS estaciones_conteo
      FROM bc_mantenimientos m
      JOIN bc_usuarios u ON m.operario_id = u.usu_documento
      LEFT JOIN (
        SELECT
          y.operario_id,
          GROUP_CONCAT(CONCAT(y.estacion_id, ':', y.cnt) SEPARATOR ',') AS estaciones_conteo
        FROM (
          SELECT
            m3.operario_id,
            m3.estacion_id,
            COUNT(m3.id) AS cnt
          FROM bc_mantenimientos m3
          WHERE 1=1 ${whereConditionsM3}
          GROUP BY m3.operario_id, m3.estacion_id
        ) y
        GROUP BY y.operario_id
      ) sc ON sc.operario_id = u.usu_documento
      WHERE 1=1 ${whereConditions}
      GROUP BY u.usu_documento, u.usu_nombre, sc.estaciones_conteo
      HAVING total_mantenimientos > 0
      ORDER BY total_mantenimientos DESC
    `;
    
    const estadisticas = await sequelize.query(query, { 
      replacements,
      type: sequelize.QueryTypes.SELECT 
    });
    
    const estadisticasConEstaciones = estadisticas.map(item => {
      item.estaciones_ids = item.estaciones_ids ? item.estaciones_ids.split(',') : [];
      item.estaciones_conteo = item.estaciones_conteo ? String(item.estaciones_conteo) : "";
      
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
        AVG(CASE 
          WHEN m.estado = 'finalizado' AND m.fecha_finalizacion IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, m.fecha_creacion, m.fecha_finalizacion) 
          ELSE NULL 
        END) AS tiempo_promedio_horas,
        GROUP_CONCAT(DISTINCT m.estacion_id) AS estaciones_ids
      FROM bc_mantenimientos m
      JOIN bc_usuarios u ON m.operario_id = u.usu_documento
      WHERE 1=1 ${whereConditions}
      GROUP BY u.usu_documento, u.usu_nombre, m.empresa_id, m.estacion_id
      HAVING total_mantenimientos > 0
      ORDER BY total_mantenimientos DESC
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
                [Op.lt]: mañana,
            };
        }

        const bicicletaWhere = {};
        let hasBicicletaFilter = false;

        const rawBicicletas = filterObj.bicicletas;
        let bicicletasSeleccionadas = [];
        if (rawBicicletas) {
            try {
                if (Array.isArray(rawBicicletas)) {
                    bicicletasSeleccionadas = rawBicicletas;
                } else if (typeof rawBicicletas === 'string') {
                    const trimmed = rawBicicletas.trim();
                    if (trimmed.startsWith('[')) {
                        bicicletasSeleccionadas = JSON.parse(trimmed);
                    } else {
                        bicicletasSeleccionadas = trimmed.split(',');
                    }
                }
            } catch (e) {
                bicicletasSeleccionadas = [];
            }

            bicicletasSeleccionadas = (bicicletasSeleccionadas || [])
                .map((x) => String(x).trim())
                .filter((x) => x !== '');

            if (bicicletasSeleccionadas.length > 0) {
                hasBicicletaFilter = true;
                bicicletaWhere.bic_numero = { [Op.in]: bicicletasSeleccionadas };
            }
        }

        if (!hasBicicletaFilter && filterObj.bicicleta) {
            hasBicicletaFilter = true;
            bicicletaWhere[Op.or] = [
                { bic_numero: { [Op.like]: `%${filterObj.bicicleta}%` } },
                { bic_id: isNaN(filterObj.bicicleta) ? null : parseInt(filterObj.bicicleta) },
            ];
        }

        if (filterObj.ordenar_por === 'bicicletas_taller') {
            bicicletaWhere.bic_estado = {
                [Op.in]: ['EN_MANTENIMIENTO', 'EN TALLER', 'REPARACION', 'REVISION'],
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
                    where: hasBicicletaFilter ? bicicletaWhere : undefined,
                    required: !!hasBicicletaFilter,
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

        const rawBicicletas = filterObj.bicicletas;
        let bicicletasSeleccionadas = [];
        if (rawBicicletas) {
            try {
                if (Array.isArray(rawBicicletas)) {
                    bicicletasSeleccionadas = rawBicicletas;
                } else if (typeof rawBicicletas === 'string') {
                    const trimmed = rawBicicletas.trim();
                    if (trimmed.startsWith('[')) {
                        bicicletasSeleccionadas = JSON.parse(trimmed);
                    } else {
                        bicicletasSeleccionadas = trimmed.split(',');
                    }
                }
            } catch (e) {
                bicicletasSeleccionadas = [];
            }
        }

        bicicletasSeleccionadas = (bicicletasSeleccionadas || [])
            .map((x) => String(x).trim())
            .filter((x) => x !== '');

        if (bicicletasSeleccionadas.length > 0) {
            bicicletaWhere.bic_numero = { [Op.in]: bicicletasSeleccionadas };
        } else if (filterObj.bicicleta) {
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
                    required: true,
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

const getProductividadOperarios = async (req, res) => {
    const startedAt = Date.now();
    const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    try {
        const queryParams = (req && req.query) || {};
        let filterParams = {};
        if (queryParams && queryParams.filter) {
            try {
                filterParams = JSON.parse(queryParams.filter);
            } catch (e) {
                filterParams = {};
            }
        }

        const params = { ...queryParams, ...filterParams };
        delete params.filter;

        const { fecha_inicio, fecha_fin, empresa_id, estacion_id, operario_id } = params || {};

        const debugDetalle =
            params &&
            (params.debug_detalle === true ||
                params.debug_detalle === "1" ||
                params.debug_detalle === 1);
        const debugDetalleHeader =
            req &&
            req.headers &&
            (req.headers["x-debug-detalle"] === "1" || req.headers["x-debug-detalle"] === 1);
        const debugDetalleEnv =
            process.env &&
            (process.env.DEBUG_PRODUCTIVIDAD === "1" || process.env.DEBUG_PRODUCTIVIDAD === "true");
        const debugAlwaysEnv =
            process.env &&
            (process.env.DEBUG_PRODUCTIVIDAD_ALWAYS === "1" ||
                process.env.DEBUG_PRODUCTIVIDAD_ALWAYS === "true");

        const auditEnabled =
            !!debugAlwaysEnv || !!debugDetalle || !!debugDetalleHeader || !!debugDetalleEnv;

        const soloFinalizados =
            params &&
            (params.solo_finalizados === true ||
                params.solo_finalizados === "1" ||
                params.solo_finalizados === 1);

        if (!fecha_inicio || !fecha_fin) {
            return handleHttpError(res, "FECHAS_REQUERIDAS", 400);
        }

        const start = new Date(fecha_inicio);
        const end = new Date(fecha_fin);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            return handleHttpError(res, "RANGO_FECHAS_INVALIDO", 400);
        }
        const tzFrom = "+00:00";
        const tzTo = "-05:00";
        const fechaCreacionLocalDate = sequelize.fn(
            "DATE",
            sequelize.fn("CONVERT_TZ", sequelize.col("fecha_creacion"), tzFrom, tzTo),
        );

        const whereMant = {
            [Op.and]: [
                sequelize.where(fechaCreacionLocalDate, {
                    [Op.gte]: fecha_inicio,
                    [Op.lte]: fecha_fin,
                }),
            ],
        };
        if (empresa_id) whereMant.empresa_id = empresa_id;
        if (estacion_id) whereMant.estacion_id = estacion_id;
        if (operario_id) whereMant.operario_id = operario_id;
        if (soloFinalizados) whereMant.estado = "finalizado";

        const mantenimientosAgg = await mantenimientoModels.findAll({
            attributes: [
                [fechaCreacionLocalDate, "fecha"],
                "operario_id",
                "estacion_id",
                "empresa_id",
                [
                    sequelize.fn(
                        "COUNT",
                        sequelize.fn(
                            "DISTINCT",
                            sequelize.col("bc_mantenimientos.bicicleta_id"),
                        ),
                    ),
                    "bicicletas_revisadas",
                ],
                [
                    sequelize.fn(
                        "COUNT",
                        sequelize.fn(
                            "DISTINCT",
                            sequelize.literal(
                                "CASE WHEN bc_bicicleta.bic_estado IS NOT NULL AND UPPER(bc_bicicleta.bic_estado) <> 'DISPONIBLE' THEN bc_mantenimientos.bicicleta_id END",
                            ),
                        ),
                    ),
                    "bicicletas_no_disponibles_revisadas",
                ],
            ],
            where: whereMant,
            include: [
                {
                    model: bicicletasModels,
                    attributes: [],
                    required: false,
                },
            ],
            group: [fechaCreacionLocalDate, "operario_id", "estacion_id", "empresa_id"],
            raw: true,
        });

        const estaciones = Array.from(
            new Set(
                (mantenimientosAgg || [])
                    .map((x) => (x ? x.estacion_id : null))
                    .filter((x) => x !== null && x !== undefined),
            ),
        );

        const estacionesNumericas = estaciones
            .map((x) => String(x).trim())
            .filter((x) => /^\d+$/.test(x))
            .map((x) => Number(x));

        const estRows = estacionesNumericas.length
            ? await estacionModels.findAll({
                  attributes: ["est_id", "est_estacion"],
                  where: { est_id: { [Op.in]: estacionesNumericas } },
                  raw: true,
              })
            : [];

        const estacionIdToNombre = new Map();
        for (const e of estRows || []) {
            if (e && e.est_id !== undefined && e.est_id !== null) {
                estacionIdToNombre.set(Number(e.est_id), e.est_estacion);
            }
        }

        const estacionesBiciKeys = estaciones.map((x) => {
            const str = String(x).trim();
            if (/^\d+$/.test(str)) {
                const nombre = estacionIdToNombre.get(Number(str));
                return nombre ? String(nombre) : str;
            }
            return str;
        });

        const dispRows = estacionesBiciKeys.length
            ? await bicicletasModels.findAll({
                  attributes: [
                      [sequelize.col("bic_estacion"), "estacion_id"],
                      [sequelize.fn("COUNT", sequelize.col("bic_id")), "bicicletas_disponibles"],
                  ],
                  where: {
                      [Op.and]: [
                          sequelize.where(
                              sequelize.fn("UPPER", sequelize.col("bic_estado")),
                              "DISPONIBLE",
                          ),
                      ],
                      bic_estacion: { [Op.in]: estacionesBiciKeys },
                  },
                  group: ["bic_estacion"],
                  raw: true,
              })
            : [];

        const dispMap = new Map();
        for (const d of dispRows || []) {
            dispMap.set(String(d.estacion_id), Number(d.bicicletas_disponibles || 0));
        }

        const totRows = estacionesBiciKeys.length
            ? await bicicletasModels.findAll({
                  attributes: [
                      [sequelize.col("bic_estacion"), "estacion_id"],
                      [sequelize.fn("COUNT", sequelize.col("bic_id")), "bicicletas_total"],
                  ],
                  where: {
                      bic_estacion: { [Op.in]: estacionesBiciKeys },
                  },
                  group: ["bic_estacion"],
                  raw: true,
              })
            : [];

        const totMap = new Map();
        for (const t of totRows || []) {
            totMap.set(String(t.estacion_id), Number(t.bicicletas_total || 0));
        }

        const fechas = Array.from(
            new Set(
                (mantenimientosAgg || [])
                    .map((x) => (x && x.fecha !== undefined && x.fecha !== null ? String(x.fecha).trim() : null))
                    .filter((x) => x),
            ),
        );

        const estacionesBiciKeysUnique = Array.from(
            new Set((estacionesBiciKeys || []).map((x) => String(x).trim()).filter((x) => x !== "")),
        );

        const estadosPrestamoActivos = [
            "ACTIVA",
            "PRESTAMO PERSONALIZADO",
            "PRESTAMO DE EMERGENCIA",
        ];

        // Conteo de bicicletas NO disponibles por fecha+estación en el periodo:
        // - Préstamo activo en el día
        // - Reserva activa en el día
        // - Registro PP en el día
        const unavailableByFechaEstacion = new Map();
        if (fechas.length && estacionesBiciKeysUnique.length) {
            for (const fechaDia of fechas) {
                const dayLike = `${fechaDia}%`;
                const rowsUnavailable = await sequelize.query(
                    `
                    SELECT
                      b.bic_estacion AS estacion_id,
                      COUNT(DISTINCT x.bic_id) AS unavailable
                    FROM (
                      SELECT p.pre_bicicleta AS bic_id
                      FROM bc_prestamos p
                      WHERE p.pre_estado IN (:estadosPrestamoActivos)
                        AND p.pre_retiro_fecha <= CONCAT(:fechaDia, ' 23:59:59')
                        AND (p.pre_devolucion_fecha IS NULL OR p.pre_devolucion_fecha >= CONCAT(:fechaDia, ' 00:00:00'))

                      UNION

                      SELECT r.res_bicicleta AS bic_id
                      FROM bc_reservas r
                      WHERE r.res_estado = 'ACTIVA'
                        AND r.res_fecha_inicio <= :fechaDia
                        AND r.res_fecha_fin >= :fechaDia

                      UNION

                      SELECT b2.bic_id AS bic_id
                      FROM bc_registros_pp pp
                      JOIN bc_bicicletas b2 ON b2.bic_numero = pp.vehiculo
                      WHERE pp.fecha LIKE :dayLike
                    ) x
                    JOIN bc_bicicletas b ON b.bic_id = x.bic_id
                    WHERE b.bic_estacion IN (:estaciones)
                    GROUP BY b.bic_estacion
                    `,
                    {
                        type: QueryTypes.SELECT,
                        replacements: {
                            estadosPrestamoActivos,
                            fechaDia,
                            dayLike,
                            estaciones: estacionesBiciKeysUnique,
                        },
                    },
                );

                for (const u of rowsUnavailable || []) {
                    const key = `${fechaDia}__${String(u.estacion_id)}`;
                    unavailableByFechaEstacion.set(key, Number(u.unavailable || 0));
                }
            }
        }

        // Conteo de mantenimientos hechos en bicicletas NO disponibles (por fecha) para sumar al denominador.
        // Regla: si estaba prestada/reservada/PP ese día pero se hizo mantenimiento, entonces se cuenta.
        const adicionalesNoDisponiblesMap = new Map();
        if (fechas.length && estacionesBiciKeysUnique.length) {
            const adicionalesRows = await sequelize.query(
                `
                SELECT
                  DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '-05:00')) AS fecha,
                  m.operario_id AS operario_id,
                  m.estacion_id AS estacion_id,
                  m.empresa_id AS empresa_id,
                  COUNT(DISTINCT m.bicicleta_id) AS cnt
                FROM bc_mantenimientos m
                JOIN bc_bicicletas b ON b.bic_id = m.bicicleta_id
                WHERE DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '-05:00')) >= :fecha_inicio
                  AND DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '-05:00')) <= :fecha_fin
                  AND (:empresa_id IS NULL OR m.empresa_id = :empresa_id)
                  AND (:estacion_id IS NULL OR m.estacion_id = :estacion_id)
                  AND (:operario_id IS NULL OR m.operario_id = :operario_id)
                  AND (
                    EXISTS (
                      SELECT 1
                      FROM bc_prestamos p
                      WHERE p.pre_bicicleta = m.bicicleta_id
                        AND p.pre_estado IN (:estadosPrestamoActivos)
                        AND p.pre_retiro_fecha <= CONCAT(DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '-05:00')), ' 23:59:59')
                        AND (
                          p.pre_devolucion_fecha IS NULL
                          OR p.pre_devolucion_fecha >= CONCAT(DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '-05:00')), ' 00:00:00')
                        )
                    )
                    OR EXISTS (
                      SELECT 1
                      FROM bc_reservas r
                      WHERE r.res_bicicleta = m.bicicleta_id
                        AND r.res_estado = 'ACTIVA'
                        AND r.res_fecha_inicio <= DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '-05:00'))
                        AND r.res_fecha_fin >= DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '-05:00'))
                    )
                    OR EXISTS (
                      SELECT 1
                      FROM bc_registros_pp pp
                      WHERE pp.vehiculo = b.bic_numero
                        AND pp.fecha LIKE CONCAT(DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '-05:00')), '%')
                    )
                  )
                GROUP BY
                  DATE(CONVERT_TZ(m.fecha_creacion, '+00:00', '-05:00')),
                  m.operario_id,
                  m.estacion_id,
                  m.empresa_id
                `,
                {
                    type: QueryTypes.SELECT,
                    replacements: {
                        fecha_inicio,
                        fecha_fin,
                        empresa_id: empresa_id ? String(empresa_id) : null,
                        estacion_id: estacion_id ? String(estacion_id) : null,
                        operario_id: operario_id ? String(operario_id) : null,
                        estadosPrestamoActivos,
                    },
                },
            );

            for (const a of adicionalesRows || []) {
                const key = `${String(a.fecha).trim()}__${String(a.operario_id).trim()}__${String(a.estacion_id).trim()}__${String(a.empresa_id).trim()}`;
                adicionalesNoDisponiblesMap.set(key, Number(a.cnt || 0));
            }
        }

        const rows = (mantenimientosAgg || []).map((r) => {
            const estacionStr = String(r.estacion_id).trim();
            const estacionBiciKey = /^\d+$/.test(estacionStr)
                ? (estacionIdToNombre.get(Number(estacionStr)) ? String(estacionIdToNombre.get(Number(estacionStr))) : estacionStr)
                : estacionStr;

            const bicicletasTotal = totMap.get(String(estacionBiciKey)) || 0;
            const bicicletasRevisadas = Number(r.bicicletas_revisadas || 0);
            const fechaDia = String(r.fecha).trim();
            const unavailableKey = `${fechaDia}__${String(estacionBiciKey)}`;
            const unavailableCount = unavailableByFechaEstacion.get(unavailableKey) || 0;
            const bicicletasDisponibles = Math.max(bicicletasTotal - unavailableCount, 0);

            const adicionalesKey = `${fechaDia}__${String(r.operario_id).trim()}__${String(r.estacion_id).trim()}__${String(r.empresa_id).trim()}`;
            const adicionalesNoDisponibles = adicionalesNoDisponiblesMap.get(adicionalesKey) || 0;

            const bicicletasRequeridas = bicicletasDisponibles + adicionalesNoDisponibles;
            const productividad =
                bicicletasRequeridas > 0
                    ? Number(((bicicletasRevisadas / bicicletasRequeridas) * 100).toFixed(2))
                    : null;
            return {
                fecha: r.fecha,
                dia_semana: null,
                operario_id: r.operario_id,
                estacion_id: r.estacion_id,
                empresa_id: r.empresa_id,
                bicicletas_disponibles: bicicletasDisponibles,
                bicicletas_total: bicicletasTotal,
                bicicletas_revisadas: bicicletasRevisadas,
                bicicletas_no_disponibles_revisadas: adicionalesNoDisponibles,
                bicicletas_requeridas: bicicletasRequeridas,
                productividad,
                _debug: auditEnabled
                    ? {
                        estacion_id_raw: r.estacion_id,
                        estacion_bici_key: estacionBiciKey,
                        total_lookup: totMap.get(String(estacionBiciKey)) || 0,
                        unavailable_lookup: unavailableByFechaEstacion.get(unavailableKey) || 0,
                        no_disponibles_revisadas_lookup: adicionalesNoDisponibles,
                        formula:
                            "requeridas = (total - no_disponibles_en_fecha) + no_disponibles_revisadas_en_fecha; productividad = (revisadas / requeridas) * 100",
                    }
                    : undefined,
            };
        });

        const resumenMap = new Map();
        for (const r of rows) {
            const key = `${r.operario_id}__${r.empresa_id || ""}`;
            if (!resumenMap.has(key)) {
                resumenMap.set(key, {
                    operario_id: r.operario_id,
                    empresa_id: r.empresa_id,
                    total_requeridas: 0,
                    total_revisadas: 0,
                });
            }
            const acc = resumenMap.get(key);
            acc.total_requeridas += Number(r.bicicletas_requeridas || 0);
            acc.total_revisadas += Number(r.bicicletas_revisadas || 0);
        }

        const resumen = Array.from(resumenMap.values()).map((x) => {
            const productividad_total =
                x.total_requeridas > 0
                    ? ((x.total_revisadas / x.total_requeridas) * 100).toFixed(2)
                    : null;
            return { ...x, productividad_total };
        });

        let debug_detalle = null;
        if (auditEnabled) {
            const ejemplos = (rows || []).slice(0, 2);
            debug_detalle = [];

            for (const ej of ejemplos) {
                const estacionKey =
                    ej && ej._debug && ej._debug.estacion_bici_key
                        ? String(ej._debug.estacion_bici_key)
                        : String(ej.estacion_id);

                const bicicletasPorEstado = await bicicletasModels.findAll({
                    attributes: [
                        [sequelize.fn("UPPER", sequelize.col("bic_estado")), "estado"],
                        [sequelize.fn("COUNT", sequelize.col("bic_id")), "count"],
                    ],
                    where: { bic_estacion: String(estacionKey) },
                    group: [sequelize.fn("UPPER", sequelize.col("bic_estado"))],
                    raw: true,
                });

                const mantenimientosPorEstado = await mantenimientoModels.findAll({
                    attributes: [
                        "estado",
                        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
                        [
                            sequelize.fn(
                                "COUNT",
                                sequelize.fn(
                                    "DISTINCT",
                                    sequelize.col("bc_mantenimientos.bicicleta_id"),
                                ),
                            ),
                            "distinct_bicicletas",
                        ],
                    ],
                    where: {
                        operario_id: ej.operario_id,
                        empresa_id: ej.empresa_id,
                        [Op.and]: [
                            sequelize.where(fechaCreacionLocalDate, {
                                [Op.eq]: ej.fecha,
                            }),
                        ],
                    },
                    group: ["estado"],
                    raw: true,
                });

                debug_detalle.push({
                    visita: {
                        fecha: ej.fecha,
                        operario_id: ej.operario_id,
                        estacion_id: ej.estacion_id,
                        estacion_bici_key: estacionKey,
                        empresa_id: ej.empresa_id,
                    },
                    insumos: {
                        bicicletas_por_estado: bicicletasPorEstado || [],
                        mantenimientos_por_estado: mantenimientosPorEstado || [],
                    },
                    calculo_resultado: {
                        disponibles: Number(ej.bicicletas_disponibles || 0),
                        total: Number(ej.bicicletas_total || 0),
                        no_disponibles_revisadas: Number(ej.bicicletas_no_disponibles_revisadas || 0),
                        requeridas: Number(ej.bicicletas_requeridas || 0),
                        revisadas: Number(ej.bicicletas_revisadas || 0),
                        productividad: ej.productividad,
                        regla:
                            "requeridas = (total - no_disponibles_en_fecha) + no_disponibles_revisadas_en_fecha; productividad = (revisadas / requeridas) * 100",
                    },
                    flags: {
                        solo_finalizados: !!soloFinalizados,
                        debug_detalle: true,
                    },
                });
            }
        }

        return res.send({
            data: {
                periodo: { inicio: fecha_inicio, fin: fecha_fin },
                debug_detalle_flag: debugDetalle ? 1 : null,
                solo_finalizados: soloFinalizados ? 1 : null,
                rows,
                resumen,
                debug_detalle,
            },
        });
    } catch (error) {
        console.error("Error al obtener productividad:", error);
        handleHttpError(res, "ERROR_GET_PRODUCTIVIDAD_OPERARIOS");
    } finally {
        const elapsedMs = Date.now() - startedAt;
        const audit =
            (req &&
                req.query &&
                req.query.filter &&
                (() => {
                    try {
                        const f = JSON.parse(req.query.filter);
                        return f && (f.debug_detalle === true || f.debug_detalle === "1" || f.debug_detalle === 1);
                    } catch (e) {
                        return false;
                    }
                })()) ||
            (req &&
                req.query &&
                (req.query.debug_detalle === true || req.query.debug_detalle === "1" || req.query.debug_detalle === 1)) ||
            (req &&
                req.headers &&
                (req.headers["x-debug-detalle"] === "1" || req.headers["x-debug-detalle"] === 1)) ||
            (process.env && (process.env.DEBUG_PRODUCTIVIDAD === "1" || process.env.DEBUG_PRODUCTIVIDAD === "true"));
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
  getProductividadOperarios,
  getEstadisticasOperariosByEmpresa,
  getEstadisticasOperariosByEstacion,
  getComponentesPorBicicleta,
  trasladoMasivoMantenimientos,
  getHistorialMantenimiento,
  exportMantenimientosPorEmpresa,
  exportMantenimientosPorEstacion,
};