const { introduccionModulosModels, introduccionModuloPreguntasModels, introduccionModuloUsuarioModels, usuarioModels, empresaModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');
const { enviarCertificadoMovilidad } = require('../utils/emailCertificadoMovilidad');

const helperSanitizeOpciones = (opciones) => {
    let result = opciones;
    while (typeof result === 'string') {
        try {
            result = JSON.parse(result);
        } catch (e) {
            break;
        }
    }
    if (!Array.isArray(result)) {
        return [];
    }
    return result.map((o) => String(o).trim());
};

/**
 * Obtener id de usuario del token o req
 */
const getUserIdFromReq = (req) => {
    return (
        req.user?.userId ||
        req.user?.id ||
        req.user?.usu_documento ||
        req.query?.id_usuario ||
        req.body?.id_usuario ||
        'default_user'
    );
};

const sanitizeVideoUrl = (url) => {
    const officialVideo = 'https://bicyclecapital.co/wp-content/uploads/2026/03/Bcguiavideo2024.mp4';
    if (!url || typeof url !== 'string') return officialVideo;
    const trimmed = url.trim();
    if (
        trimmed.includes('ForBiggerBlazes.mp4') ||
        trimmed.includes('ForBiggerEscapes.mp4') ||
        trimmed.includes('ForBiggerFun.mp4') ||
        trimmed.includes('commondatastorage.googleapis.com')
    ) {
        return officialVideo;
    }
    return trimmed;
};

/**
 * Función auxiliar para verificar la secuencia y disponibilidad de submódulos
 */
const helperCalcularSecuencia = async (userId) => {
    // Consultar todos los submódulos activos ordenados por `orden` ASC
    const modulos = await introduccionModulosModels.findAll({
        where: {
            [Op.or]: [{ estado: 'ACTIVA' }, { estado: 'ACTIVO' }, { estado: 1 }]
        },
        order: [['orden', 'ASC']],
        raw: true
    });

    // Consultar el progreso del usuario
    const progresosUsuario = await introduccionModuloUsuarioModels.findAll({
        where: { id_usuario: String(userId) },
        raw: true
    });

    const mapaProgreso = new Map();
    progresosUsuario.forEach((p) => {
        mapaProgreso.set(Number(p.id_modulo), p.estado_prueba);
    });

    const modulosCalculados = [];
    let previoAprobado = true; // El primer módulo siempre está disponible inicialmente

    for (let i = 0; i < modulos.length; i++) {
        const mod = modulos[i];
        const modId = Number(mod.id);
        const estadoGuardado = mapaProgreso.get(modId);

        let disponible = false;
        let estadoUsuario = 'bloqueado';

        const estadoUpper = String(estadoGuardado || '').toUpperCase();
        const isApproved = (estadoUpper === 'APROBADA' || estadoUpper === 'APROBADO');
        const isReproved = (estadoUpper === 'REPROBADA' || estadoUpper === 'REPROBADO');

        if (previoAprobado) {
            disponible = true;
            if (isApproved) {
                estadoUsuario = 'aprobado';
            } else if (isReproved) {
                estadoUsuario = 'reprobado';
            } else {
                estadoUsuario = 'pendiente';
            }
        } else {
            disponible = false;
            estadoUsuario = 'bloqueado';
        }

        // Para el siguiente ciclo, se requiere que ESTE submódulo esté aprobado
        previoAprobado = isApproved;

        modulosCalculados.push({
            id: mod.id,
            titulo: mod.titulo,
            url_video: sanitizeVideoUrl(mod.url_video),
            orden: mod.orden,
            total_preguntas: mod.total_preguntas,
            min_preguntas_aprobar: mod.min_preguntas_aprobar,
            estado_usuario: estadoUsuario,
            disponible: disponible
        });
    }

    return modulosCalculados;
};

/**
 * GET /introduccion-movilidad/modulos
 * Lista todos los submódulos con su estado y disponibilidad para el usuario autenticado.
 */
const getModulos = async (req, res) => {
    try {
        const userId = getUserIdFromReq(req);
        const modulosCalculados = await helperCalcularSecuencia(userId);
        res.send(modulosCalculados);
    } catch (error) {
        console.error("Error en getModulos:", error);
        httpError(res, "ERROR_GET_MODULOS_MOVILIDAD", 500);
    }
};

/**
 * GET /introduccion-movilidad/modulos/:id
 * Obtiene el contenido de un submódulo (video y preguntas SIN respuesta verdadera).
 */
const getModuloDetalle = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserIdFromReq(req);

        const modulosCalculados = await helperCalcularSecuencia(userId);
        const moduloActual = modulosCalculados.find((m) => String(m.id) === String(id));

        if (!moduloActual) {
            return res.status(404).send({ error: "SUBMODULO_NO_ENCONTRADO" });
        }

        if (!moduloActual.disponible) {
            return res.status(403).send({
                error: "ACCESO_BLOQUEADO",
                message: "Debes aprobar el submódulo anterior antes de acceder a este contenido."
            });
        }

        const preguntasDb = await introduccionModuloPreguntasModels.findAll({
            where: { id_modulo: Number(id) },
            order: [['id', 'ASC']],
            raw: true
        });

        const preguntasSanitizadas = preguntasDb.map((p) => {
            return {
                id: p.id,
                pregunta: p.pregunta,
                opciones: helperSanitizeOpciones(p.opciones_respuestas)
            };
        });

        res.send({
            id: moduloActual.id,
            titulo: moduloActual.titulo,
            url_video: moduloActual.url_video,
            orden: moduloActual.orden,
            total_preguntas: moduloActual.total_preguntas || preguntasSanitizadas.length,
            min_preguntas_aprobar: moduloActual.min_preguntas_aprobar || 4,
            preguntas: preguntasSanitizadas
        });
    } catch (error) {
        console.error("Error en getModuloDetalle:", error);
        httpError(res, "ERROR_GET_DETALLE_SUBMODULO", 500);
    }
};

/**
 * POST /introduccion-movilidad/modulos/:id/finalizar
 * Procesa las respuestas del cuestionario, evalúa el resultado en el backend y actualiza el progreso.
 */
const finalizarModulo = async (req, res) => {
    try {
        const { id } = req.params;
        const { respuestas } = req.body;
        const userId = getUserIdFromReq(req);

        if (!respuestas || !Array.isArray(respuestas)) {
            return res.status(400).send({ error: "RESPUESTAS_REQUERIDAS" });
        }

        // Verificar que el usuario tenga permitido presentar este submódulo
        const modulosCalculados = await helperCalcularSecuencia(userId);
        const moduloActual = modulosCalculados.find((m) => String(m.id) === String(id));

        if (!moduloActual) {
            return res.status(404).send({ error: "SUBMODULO_NO_ENCONTRADO" });
        }

        if (!moduloActual.disponible) {
            return res.status(403).send({
                error: "ACCESO_BLOQUEADO",
                message: "No puedes enviar respuestas de un submódulo bloqueado."
            });
        }

        // Obtener preguntas reales con respuestas verdaderas de la BD
        const preguntasDb = await introduccionModuloPreguntasModels.findAll({
            where: { id_modulo: Number(id) },
            raw: true
        });

        if (preguntasDb.length === 0) {
            return res.status(400).send({ error: "NO_HAY_PREGUNTAS_PARA_ESTE_MODULO" });
        }

        const mapaRespuestasUsuario = new Map();
        respuestas.forEach((r) => {
            mapaRespuestasUsuario.set(Number(r.id_pregunta), String(r.respuesta).trim());
        });

        let aciertos = 0;
        const totalPreguntas = preguntasDb.length;

        preguntasDb.forEach((p) => {
            const respuestaUsuario = mapaRespuestasUsuario.get(Number(p.id));
            if (respuestaUsuario && respuestaUsuario === String(p.respuesta_verdadera).trim()) {
                aciertos++;
            }
        });

        const moduloDb = await introduccionModulosModels.findByPk(Number(id), { raw: true });
        const minAprobar = (moduloDb && moduloDb.min_preguntas_aprobar != null)
            ? Number(moduloDb.min_preguntas_aprobar)
            : Math.ceil(totalPreguntas * 0.8);

        const porcentaje = Math.round((aciertos / totalPreguntas) * 100);
        const estadoDb = aciertos >= minAprobar ? 'APROBADA' : 'REPROBADA';
        const estadoPrueba = aciertos >= minAprobar ? 'aprobado' : 'reprobado';

        // Guardar o actualizar registro de progreso en introduccion_modulo_usuario
        const [registroUsuario, created] = await introduccionModuloUsuarioModels.findOrCreate({
            where: {
                id_modulo: Number(id),
                id_usuario: String(userId)
            },
            defaults: {
                id_modulo: Number(id),
                id_usuario: String(userId),
                estado_prueba: estadoDb
            }
        });

        if (!created) {
            registroUsuario.estado_prueba = estadoDb;
            registroUsuario.fecha_creacion = new Date();
            await registroUsuario.save();
        }

        // Recalcular secuencia para verificar si el siguiente módulo quedó desbloqueado
        const modulosActualizados = await helperCalcularSecuencia(userId);
        const moduloSiguiente = modulosActualizados.find((m) => m.orden === moduloActual.orden + 1);
        const siguienteDesbloqueado = moduloSiguiente ? moduloSiguiente.disponible : false;

        let certificadoEnviado = false;
        let emailDestino = null;

        if (estadoDb === 'APROBADA') {
            try {
                const usuario = await usuarioModels.findOne({
                    where: {
                        [Op.or]: [
                            { usu_documento: String(userId) },
                            { usu_email: String(userId) }
                        ]
                    },
                    raw: true
                });

                if (usuario && usuario.usu_email) {
                    emailDestino = usuario.usu_email;
                    let empresaObj = null;
                    if (usuario.usu_empresa) {
                        empresaObj = await empresaModels.findOne({
                            where: { emp_nombre: usuario.usu_empresa },
                            raw: true
                        });
                    }

                    enviarCertificadoMovilidad({
                        to: usuario.usu_email,
                        userName: usuario.usu_nombre || 'Usuario',
                        userDocument: usuario.usu_documento || String(userId),
                        tituloModulo: moduloActual.titulo || 'Submódulo',
                        aciertos: aciertos,
                        totalPreguntas: totalPreguntas,
                        porcentaje: porcentaje,
                        empresaObj: empresaObj
                    }).then((result) => {
                        console.log(`[finalizarModulo] Resultado de envío de certificado:`, result);
                    }).catch((err) => {
                        console.error(`[finalizarModulo] Error enviando certificado:`, err);
                    });

                    certificadoEnviado = true;
                }
            } catch (errCert) {
                console.error("Error al preparar envío de certificado:", errCert);
            }
        }

        res.send({
            estado: estadoPrueba,
            respuestas_correctas: aciertos,
            total_preguntas: totalPreguntas,
            min_preguntas_aprobar: minAprobar,
            porcentaje: porcentaje,
            siguiente_modulo_desbloqueado: siguienteDesbloqueado,
            certificado_enviado: certificadoEnviado,
            email_destino: emailDestino
        });
    } catch (error) {
        console.error("Error en finalizarModulo:", error);
        httpError(res, "ERROR_FINALIZAR_MODULO", 500);
    }
};

/**
 * --- ENDPOINTS DE ADMINISTRACIÓN ---
 */

/**
 * Obtener todos los submódulos para administración
 */
const getAdminModulos = async (req, res) => {
    try {
        const modulos = await introduccionModulosModels.findAll({
            order: [['orden', 'ASC']],
            raw: true
        });

        const modulosConPreguntas = await Promise.all(modulos.map(async (m) => {
            const countPreguntas = await introduccionModuloPreguntasModels.count({
                where: { id_modulo: m.id }
            });
            return {
                ...m,
                total_preguntas_registradas: countPreguntas
            };
        }));

        res.send({ data: modulosConPreguntas });
    } catch (error) {
        console.error("Error en getAdminModulos:", error);
        httpError(res, "ERROR_GET_ADMIN_MODULOS", 500);
    }
};

/**
 * Crear un nuevo submódulo
 */
const crearModulo = async (req, res) => {
    try {
        const { titulo, url_video, orden, total_preguntas, min_preguntas_aprobar, estado } = req.body;
        const nuevo = await introduccionModulosModels.create({
            titulo,
            url_video: sanitizeVideoUrl(url_video),
            orden: Number(orden) || 1,
            total_preguntas: Number(total_preguntas) || 5,
            min_preguntas_aprobar: Number(min_preguntas_aprobar) || 4,
            estado: estado || 'ACTIVA'
        });
        res.send({ data: nuevo });
    } catch (error) {
        console.error("Error en crearModulo:", error);
        httpError(res, "ERROR_CREAR_MODULO", 500);
    }
};

/**
 * Actualizar un submódulo existente
 */
const actualizarModulo = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, url_video, orden, total_preguntas, min_preguntas_aprobar, estado } = req.body;
        const modulo = await introduccionModulosModels.findByPk(id);
        if (!modulo) return res.status(404).send({ error: "MODULO_NO_ENCONTRADO" });

        if (titulo !== undefined) modulo.titulo = titulo;
        if (url_video !== undefined) modulo.url_video = sanitizeVideoUrl(url_video);
        if (orden !== undefined) modulo.orden = Number(orden);
        if (total_preguntas !== undefined) modulo.total_preguntas = Number(total_preguntas);
        if (min_preguntas_aprobar !== undefined) modulo.min_preguntas_aprobar = Number(min_preguntas_aprobar);
        if (estado !== undefined) modulo.estado = estado;

        await modulo.save();
        res.send({ data: modulo });
    } catch (error) {
        console.error("Error en actualizarModulo:", error);
        httpError(res, "ERROR_ACTUALIZAR_MODULO", 500);
    }
};

/**
 * Eliminar un submódulo
 */
const eliminarModulo = async (req, res) => {
    try {
        const { id } = req.params;
        await introduccionModulosModels.destroy({ where: { id } });
        res.send({ data: { id, deleted: true } });
    } catch (error) {
        console.error("Error en eliminarModulo:", error);
        httpError(res, "ERROR_ELIMINAR_MODULO", 500);
    }
};

/**
 * Obtener preguntas de un submódulo
 */
const getAdminPreguntas = async (req, res) => {
    try {
        const { id_modulo } = req.params;
        const preguntas = await introduccionModuloPreguntasModels.findAll({
            where: { id_modulo: Number(id_modulo) },
            order: [['id', 'ASC']],
            raw: true
        });

        const result = preguntas.map((p) => {
            return { ...p, opciones_respuestas: helperSanitizeOpciones(p.opciones_respuestas) };
        });

        res.send({ data: result });
    } catch (error) {
        console.error("Error en getAdminPreguntas:", error);
        httpError(res, "ERROR_GET_ADMIN_PREGUNTAS", 500);
    }
};

/**
 * Crear una nueva pregunta para un submódulo
 */
const crearPregunta = async (req, res) => {
    try {
        const { id_modulo, pregunta, opciones_respuestas, respuesta_verdadera } = req.body;
        const opcionesClean = helperSanitizeOpciones(opciones_respuestas);

        const nueva = await introduccionModuloPreguntasModels.create({
            id_modulo: Number(id_modulo),
            pregunta,
            opciones_respuestas: opcionesClean,
            respuesta_verdadera: String(respuesta_verdadera).trim()
        });
        res.send({ data: { ...nueva.toJSON(), opciones_respuestas: opcionesClean } });
    } catch (error) {
        console.error("Error en crearPregunta:", error);
        httpError(res, "ERROR_CREAR_PREGUNTA", 500);
    }
};

/**
 * Actualizar una pregunta existente
 */
const actualizarPregunta = async (req, res) => {
    try {
        const { id } = req.params;
        const { pregunta, opciones_respuestas, respuesta_verdadera } = req.body;
        const registro = await introduccionModuloPreguntasModels.findByPk(id);
        if (!registro) return res.status(404).send({ error: "PREGUNTA_NO_ENCONTRADA" });

        if (pregunta !== undefined) registro.pregunta = pregunta;
        if (opciones_respuestas !== undefined) {
            registro.opciones_respuestas = helperSanitizeOpciones(opciones_respuestas);
        }
        if (respuesta_verdadera !== undefined) registro.respuesta_verdadera = String(respuesta_verdadera).trim();

        await registro.save();
        res.send({ data: { ...registro.toJSON(), opciones_respuestas: helperSanitizeOpciones(registro.opciones_respuestas) } });
    } catch (error) {
        console.error("Error en actualizarPregunta:", error);
        httpError(res, "ERROR_ACTUALIZAR_PREGUNTA", 500);
    }
};

/**
 * Eliminar una pregunta
 */
const eliminarPregunta = async (req, res) => {
    try {
        const { id } = req.params;
        await introduccionModuloPreguntasModels.destroy({ where: { id } });
        res.send({ data: { id, deleted: true } });
    } catch (error) {
        console.error("Error en eliminarPregunta:", error);
        httpError(res, "ERROR_ELIMINAR_PREGUNTA", 500);
    }
};

/**
 * Obtener reportes y analíticas de usuarios para administración
 */
const getAdminReportes = async (req, res) => {
    try {
        const { empresa, id_modulo, estado_prueba, busqueda, fecha_inicio, fecha_fin } = req.query;

        let whereConditions = [];
        let replacements = {};

        if (id_modulo) {
            whereConditions.push("imu.id_modulo = :id_modulo");
            replacements.id_modulo = Number(id_modulo);
        }
        if (estado_prueba) {
            whereConditions.push("imu.estado_prueba = :estado_prueba");
            replacements.estado_prueba = estado_prueba;
        }
        if (empresa) {
            whereConditions.push("(u.usu_empresa = :empresa OR e.emp_nombre = :empresa)");
            replacements.empresa = empresa;
        }
        if (busqueda) {
            whereConditions.push("(u.usu_documento LIKE :busqueda OR u.usu_nombre LIKE :busqueda OR u.usu_email LIKE :busqueda)");
            replacements.busqueda = `%${busqueda}%`;
        }
        if (fecha_inicio) {
            whereConditions.push("imu.fecha_creacion >= :fecha_inicio");
            replacements.fecha_inicio = `${fecha_inicio} 00:00:00`;
        }
        if (fecha_fin) {
            whereConditions.push("imu.fecha_creacion <= :fecha_fin");
            replacements.fecha_fin = `${fecha_fin} 23:59:59`;
        }

        const whereClause = whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";

        const sql = `
            SELECT 
                imu.id,
                imu.id_modulo,
                im.titulo AS modulo_titulo,
                im.min_preguntas_aprobar,
                im.total_preguntas,
                imu.id_usuario,
                COALESCE(u.usu_nombre, imu.id_usuario) AS usuario_nombre,
                COALESCE(u.usu_email, '') AS usuario_email,
                COALESCE(u.usu_empresa, 'General') AS usuario_empresa,
                imu.estado_prueba,
                imu.fecha_creacion
            FROM introduccion_modulo_usuario imu
            INNER JOIN introduccion_modulos im ON im.id = imu.id_modulo
            LEFT JOIN bc_usuarios u ON u.usu_documento = imu.id_usuario
            LEFT JOIN bc_empresas e ON e.emp_nombre = u.usu_empresa
            ${whereClause}
            ORDER BY imu.fecha_creacion DESC
        `;

        const { sequelize } = require('../config/mysql');
        const [rows] = await sequelize.query(sql, { replacements });

        // Resumen estadístico
        const totalEvaluaciones = rows.length;
        const aprobados = rows.filter(r => String(r.estado_prueba).toUpperCase() === 'APROBADA' || String(r.estado_prueba).toLowerCase() === 'aprobado').length;
        const reprobados = rows.filter(r => String(r.estado_prueba).toUpperCase() === 'REPROBADA' || String(r.estado_prueba).toLowerCase() === 'reprobado').length;
        const pendientes = rows.filter(r => String(r.estado_prueba).toUpperCase() === 'PENDIENTE' || String(r.estado_prueba).toLowerCase() === 'pendiente').length;
        const porcentajeAprobacion = totalEvaluaciones > 0 ? Math.round((aprobados / totalEvaluaciones) * 100) : 0;

        res.send({
            resumen: {
                total_evaluaciones: totalEvaluaciones,
                aprobados,
                reprobados,
                pendientes,
                porcentaje_aprobacion: porcentajeAprobacion
            },
            data: rows
        });
    } catch (error) {
        console.error("Error en getAdminReportes:", error);
        httpError(res, "ERROR_GET_ADMIN_REPORTES", 500);
    }
};

module.exports = {
    getModulos,
    getModuloDetalle,
    finalizarModulo,
    getAdminModulos,
    crearModulo,
    actualizarModulo,
    eliminarModulo,
    getAdminPreguntas,
    crearPregunta,
    actualizarPregunta,
    eliminarPregunta,
    getAdminReportes
};
