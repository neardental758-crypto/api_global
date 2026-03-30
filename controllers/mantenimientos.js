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

const getComponentesConCategorias = async (req, res) => res.status(501).send({ error: 'NOT_IMPLEMENTED' });
const crearMantenimientosMasivo = async (req, res) => res.status(501).send({ error: 'NOT_IMPLEMENTED' });
const actualizarHistorialComponente = async (req, res) => res.status(501).send({ error: 'NOT_IMPLEMENTED' });
const crearHistorialComponente = async (req, res) => res.status(501).send({ error: 'NOT_IMPLEMENTED' });
const getEstadisticasOperarios = async (req, res) => res.status(501).send({ error: 'NOT_IMPLEMENTED' });
const getRendimientoOperarios = async (req, res) => res.status(501).send({ error: 'NOT_IMPLEMENTED' });
const getEstadisticasOperariosByEmpresa = async (req, res) => res.status(501).send({ error: 'NOT_IMPLEMENTED' });
const getEstadisticasOperariosByEstacion = async (req, res) => res.status(501).send({ error: 'NOT_IMPLEMENTED' });
const getComponentesPorBicicleta = async (req, res) => res.status(501).send({ error: 'NOT_IMPLEMENTED' });
const trasladoMasivoMantenimientos = async (req, res) => res.status(501).send({ error: 'NOT_IMPLEMENTED' });
const getHistorialMantenimiento = async (req, res) => res.status(501).send({ error: 'NOT_IMPLEMENTED' });


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