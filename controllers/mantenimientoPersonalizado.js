const { 
  prestamosModels, 
  mantenimientoModels, 
  bicicletasModels, 
  usuarioModels, 
  tokenMsnModels, 
  historialNotificacionesModels, 
  estacionModels, 
  empresaModels 
} = require('../models');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const admin = require('../config/firebase');
const { programarMantenimientosSemanalesSura } = require('../services/mantenimientoPersonalizado');
const { httpError } = require('../utils/handleError');

/**
 * Endpoint para obtener el resumen de cobertura de mantenimientos preventivos
 */
const getResumen = async (req, res) => {
  try {
    // 1. Obtener la estación
    const estacion = await estacionModels.findOne({
      where: { est_estacion: { [Op.like]: '%Davivienda Torre Sura%' } }
    });

    if (!estacion) {
      return res.status(404).json({ success: false, message: "Estación no encontrada" });
    }

    // 2. Obtener préstamos personalizados
    const prestamos = await prestamosModels.findAll({
      where: {
        pre_devolucion_estacion: { [Op.like]: '%Davivienda Torre Sura%' },
        pre_estado: { [Op.like]: '%PRESTAMO PERSONALIZADO%' }
      }
    });

    const totalVehiculos = prestamos.length;
    const bicisIds = prestamos.map(p => p.pre_bicicleta).filter(id => id);

    if (totalVehiculos === 0) {
      return res.json({
        success: true,
        data: {
          totalVehiculos: 0,
          mantenidosTrimestre: 0,
          activosProgramados: 0,
          pendientesProgramacion: 0,
          porcentajeCobertura: 0
        }
      });
    }

    // 3. Mantenidos en los últimos 90 días (3 meses)
    const hace90Dias = new Date();
    hace90Dias.setDate(hace90Dias.getDate() - 90);

    const mantenidos = await mantenimientoModels.findAll({
      where: {
        bicicleta_id: { [Op.in]: bicisIds },
        tipo_mantenimiento: 'preventivo',
        estado: 'finalizado',
        fecha_finalizacion: { [Op.gte]: hace90Dias }
      },
      attributes: ['bicicleta_id'],
      group: ['bicicleta_id']
    });
    const mantenidosCount = mantenidos.length;

    // 4. Mantenimientos actualmente pendientes/en proceso
    const activos = await mantenimientoModels.findAll({
      where: {
        bicicleta_id: { [Op.in]: bicisIds },
        tipo_mantenimiento: 'preventivo',
        estado: { [Op.in]: ['pendiente', 'en_proceso'] }
      },
      attributes: ['bicicleta_id'],
      group: ['bicicleta_id']
    });
    const activosCount = activos.length;

    const pendientesProgramacion = Math.max(0, totalVehiculos - mantenidosCount - activosCount);
    const porcentajeCobertura = Math.round((mantenidosCount / totalVehiculos) * 100) || 0;

    res.json({
      success: true,
      data: {
        totalVehiculos,
        mantenidosTrimestre: mantenidosCount,
        activosProgramados: activosCount,
        pendientesProgramacion,
        porcentajeCobertura
      }
    });
  } catch (error) {
    console.error('Error en getResumen:', error);
    httpError(res, "ERROR_GET_RESUMEN_MANTENIMIENTOS_PERSONALIZADOS");
  }
};

/**
 * Endpoint para obtener el listado de vehículos programados esta semana (preventivos pendientes/en proceso)
 */
const getProgramados = async (req, res) => {
  try {
    const estacion = await estacionModels.findOne({
      where: { est_estacion: { [Op.like]: '%Davivienda Torre Sura%' } }
    });

    if (!estacion) {
      return res.status(404).json({ success: false, message: "Estación no encontrada" });
    }

    // Buscar mantenimientos activos de tipo preventivo en esta estación
    const mantenimientos = await mantenimientoModels.findAll({
      where: {
        estacion_id: String(estacion.est_id),
        tipo_mantenimiento: 'preventivo',
        estado: { [Op.in]: ['pendiente', 'en_proceso'] }
      },
      include: [
        {
          model: bicicletasModels,
          attributes: ['bic_id', 'bic_numero', 'bic_nombre', 'bic_estado']
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });

    // Mapear con la información de préstamo activo para saber qué usuario tiene asignada la bicicleta
    const dataFormatted = [];

    for (const mant of mantenimientos) {
      // Buscar el préstamo personalizado activo para esta bicicleta
      const prestamo = await prestamosModels.findOne({
        where: {
          pre_bicicleta: mant.bicicleta_id,
          pre_devolucion_estacion: { [Op.like]: '%Davivienda Torre Sura%' },
          pre_estado: { [Op.like]: '%PRESTAMO PERSONALIZADO%' }
        },
        include: [
          {
            model: usuarioModels,
            as: 'usuario',
            attributes: ['usu_documento', 'usu_nombre', 'usu_email', 'usu_telefono']
          }
        ]
      });

      dataFormatted.push({
        mantenimiento_id: mant.id,
        fecha_creacion: mant.fecha_creacion,
        estado: mant.estado,
        prioridad: mant.prioridad,
        comentarios: mant.comentarios,
        bicicleta: mant.bc_bicicleta ? {
          id: mant.bc_bicicleta.bic_id,
          numero: mant.bc_bicicleta.bic_numero,
          nombre: mant.bc_bicicleta.bic_nombre,
          estado: mant.bc_bicicleta.bic_estado
        } : null,
        usuario: prestamo && prestamo.usuario ? {
          documento: prestamo.usuario.usu_documento,
          nombre: prestamo.usuario.usu_nombre,
          email: prestamo.usuario.usu_email,
          telefono: prestamo.usuario.usu_telefono
        } : {
          documento: prestamo ? prestamo.pre_usuario : 'N/A',
          nombre: 'No asignado / Desconocido'
        }
      });
    }

    res.json({ success: true, data: dataFormatted });
  } catch (error) {
    console.error('Error en getProgramados:', error);
    httpError(res, "ERROR_GET_PROGRAMADOS_MANTENIMIENTOS_PERSONALIZADOS");
  }
};

/**
 * Endpoint para obtener el listado completo de vehículos con préstamo personalizado y su estado de mantenimiento
 */
const getHistorial = async (req, res) => {
  try {
    const prestamos = await prestamosModels.findAll({
      where: {
        pre_devolucion_estacion: { [Op.like]: '%Davivienda Torre Sura%' },
        pre_estado: { [Op.like]: '%PRESTAMO PERSONALIZADO%' }
      },
      include: [
        {
          model: usuarioModels,
          as: 'usuario',
          attributes: ['usu_documento', 'usu_nombre', 'usu_email']
        },
        {
          model: bicicletasModels,
          as: 'bicicleta',
          attributes: ['bic_id', 'bic_numero', 'bic_nombre', 'bic_estado']
        }
      ]
    });

    const dataFormatted = [];

    for (const p of prestamos) {
      if (!p.pre_bicicleta) continue;

      // Buscar el último mantenimiento preventivo finalizado
      const ultimoMant = await mantenimientoModels.findOne({
        where: {
          bicicleta_id: p.pre_bicicleta,
          tipo_mantenimiento: 'preventivo',
          estado: 'finalizado'
        },
        order: [['fecha_finalizacion', 'DESC']]
      });

      // Buscar si tiene algún mantenimiento preventivo activo (pendiente o en proceso)
      const activoMant = await mantenimientoModels.findOne({
        where: {
          bicicleta_id: p.pre_bicicleta,
          tipo_mantenimiento: 'preventivo',
          estado: { [Op.in]: ['pendiente', 'en_proceso'] }
        }
      });

      dataFormatted.push({
        prestamo_id: p.pre_id,
        usuario: p.usuario ? {
          documento: p.usuario.usu_documento,
          nombre: p.usuario.usu_nombre,
          email: p.usuario.usu_email
        } : {
          documento: p.pre_usuario,
          nombre: 'Desconocido'
        },
        bicicleta: p.bicicleta ? {
          id: p.bicicleta.bic_id,
          numero: p.bicicleta.bic_numero,
          nombre: p.bicicleta.bic_nombre,
          estado: p.bicicleta.bic_estado
        } : {
          id: p.pre_bicicleta,
          numero: 'N/A',
          nombre: 'Desconocido'
        },
        ultimo_mantenimiento: ultimoMant ? ultimoMant.fecha_finalizacion : null,
        dias_desde_ultimo: ultimoMant ? Math.floor((new Date() - new Date(ultimoMant.fecha_finalizacion)) / (1000 * 60 * 60 * 24)) : null,
        mantenimiento_activo: activoMant ? {
          id: activoMant.id,
          estado: activoMant.estado,
          fecha_creacion: activoMant.fecha_creacion
        } : null
      });
    }

    res.json({ success: true, data: dataFormatted });
  } catch (error) {
    console.error('Error en getHistorial:', error);
    httpError(res, "ERROR_GET_HISTORIAL_MANTENIMIENTOS_PERSONALIZADOS");
  }
};

/**
 * Enviar una notificación manual de recordatorio a un usuario específico
 */
const enviarRecordatorioManual = async (req, res) => {
  try {
    const { usuario_documento, mantenimiento_id } = req.body;

    if (!usuario_documento) {
      return res.status(400).json({ success: false, error: 'usuario_documento es requerido' });
    }

    const usuario = await usuarioModels.findOne({
      where: { usu_documento: usuario_documento }
    });

    const tokenMsn = await tokenMsnModels.findOne({
      where: { documento: usuario_documento }
    });

    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const nombreUsuario = usuario.usu_nombre || 'Usuario';
    const emailUsuario = tokenMsn ? tokenMsn.email : usuario.usu_email;
    const pushToken = tokenMsn ? tokenMsn.token : null;

    const subject = "Recordatorio: Turno de mantenimiento programado 🚲";
    const message = `Hola ${nombreUsuario}, te recordamos que tu vehículo asignado tiene un mantenimiento preventivo programado que se encuentra pendiente. Por favor, acércate lo antes posible a la estación Davivienda Torre Sura para que realicemos el mantenimiento preventivo y asegures el correcto funcionamiento de tu vehículo. ¡Muchas gracias!`;

    let notificadoPush = false;
    let notificadoEmail = false;

    // 1. Enviar Push
    if (pushToken && pushToken.trim() !== '' && pushToken.length > 140) {
      try {
        const messageId = `msg_remind_${Date.now()}_${usuario_documento}`;
        const pushMessage = {
          token: pushToken,
          notification: {
            title: subject,
            body: message
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
              messageId: messageId,
              isInApp: 'true'
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
                  title: subject,
                  body: message
                },
                sound: 'default',
                badge: 1
              }
            }
          }
        };

        await admin.messaging().send(pushMessage);
        notificadoPush = true;
      } catch (pushError) {
        console.error('Error enviando push recordatorio:', pushError.message);
      }
    }

    // 2. Enviar Correo
    if (emailUsuario && emailUsuario.trim() !== '') {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'Servicio@bicyclecapital.co',
            pass: 'fyam ecci wqby fhaj'
          }
        });

        const emailOptions = {
          from: 'Servicio@bicyclecapital.co',
          to: emailUsuario,
          subject: subject,
          html: `<p>${message}</p>`
        };

        await transporter.sendMail(emailOptions);
        notificadoEmail = true;
      } catch (emailError) {
        console.error('Error enviando correo recordatorio:', emailError.message);
      }
    }

    // 3. Registrar en Historial
    if (notificadoPush || notificadoEmail) {
      try {
        await historialNotificacionesModels.create({
          hnot_remitente: 'Recordatorio Manual Admin',
          hnot_organizacion_id: '1', // General
          hnot_titulo: subject,
          hnot_mensaje: message,
          hnot_tipo_mensaje: (notificadoPush && notificadoEmail) ? 'email-push' : (notificadoPush ? 'push' : 'email'),
          hnot_destinatarios: JSON.stringify([emailUsuario || usuario_documento]),
          hnot_destinatarios_conteo: 1,
          hnot_exitosas: (notificadoPush ? 1 : 0) + (notificadoEmail ? 1 : 0),
          hnot_fallidas: 0,
          hnot_fecha_envio: new Date()
        });
      } catch (e) {
        console.error('Error al guardar historial de recordatorio:', e.message);
      }
    }

    res.json({
      success: true,
      message: 'Recordatorios enviados correctamente',
      notificadoPush,
      notificadoEmail
    });
  } catch (error) {
    console.error('Error en enviarRecordatorioManual:', error);
    httpError(res, "ERROR_ENVIAR_RECORDATORIO");
  }
};

/**
 * Adelantar o programar manualmente el mantenimiento de una bicicleta específica
 */
const forzarMantenimiento = async (req, res) => {
  try {
    const { bicicleta_id, usuario_documento } = req.body;

    if (!bicicleta_id || !usuario_documento) {
      return res.status(400).json({ success: false, error: 'bicicleta_id y usuario_documento son requeridos' });
    }

    // Verificar si ya tiene mantenimiento preventivo activo
    const activo = await mantenimientoModels.findOne({
      where: {
        bicicleta_id,
        tipo_mantenimiento: 'preventivo',
        estado: { [Op.in]: ['pendiente', 'en_proceso'] }
      }
    });

    if (activo) {
      return res.status(400).json({ success: false, error: 'El vehículo ya tiene un mantenimiento preventivo activo' });
    }

    const OPERARIO_DEFECTO = '9732908';
    
    // Obtener estación
    const estacion = await estacionModels.findOne({
      where: { est_estacion: { [Op.like]: '%Davivienda Torre Sura%' } }
    });

    if (!estacion) {
      return res.status(404).json({ success: false, error: 'Estación "Davivienda Torre Sura" no encontrada' });
    }

    let empresaId = '1';
    if (estacion.est_empresa) {
      const empresa = await empresaModels.findOne({
        where: { emp_nombre: estacion.est_empresa }
      });
      if (empresa) {
        empresaId = empresa.emp_id;
      }
    }

    // Crear mantenimiento
    const nuevoMantenimiento = await mantenimientoModels.create({
      empresa_id: String(empresaId),
      bicicleta_id: bicicleta_id,
      operario_id: OPERARIO_DEFECTO,
      estacion_id: String(estacion.est_id),
      tipo_mantenimiento: 'preventivo',
      estado: 'pendiente',
      prioridad: 'alta', // Prioridad alta porque fue forzado
      comentarios: 'Mantenimiento preventivo adelantado manualmente por el administrador.',
      fecha_creacion: new Date()
    });

    // Enviar notificación inmediatamente
    const usuario = await usuarioModels.findOne({
      where: { usu_documento: usuario_documento }
    });

    const tokenMsn = await tokenMsnModels.findOne({
      where: { documento: usuario_documento }
    });

    const nombreUsuario = usuario ? usuario.usu_nombre : 'Usuario';
    const emailUsuario = tokenMsn ? tokenMsn.email : (usuario ? usuario.usu_email : null);
    const pushToken = tokenMsn ? tokenMsn.token : null;

    const subject = "Mantenimiento programado: ¡Tu turno ha llegado! 🚲";
    const message = `Hola ${nombreUsuario}, te informamos que se ha programado el mantenimiento preventivo para tu vehículo de manera inmediata. Por favor, acércate a la estación Davivienda Torre Sura durante la semana para realizar el respectivo mantenimiento preventivo del vehículo. ¡Gracias por tu cooperación!`;

    let notificadoPush = false;
    let notificadoEmail = false;

    // Enviar Push
    if (pushToken && pushToken.trim() !== '' && pushToken.length > 140) {
      try {
        const messageId = `msg_force_${Date.now()}_${usuario_documento}`;
        await admin.messaging().send({
          token: pushToken,
          notification: { title: subject, body: message },
          android: {
            priority: 'high',
            notification: { sound: 'default', channelId: 'high_importance_channel' }
          }
        });
        notificadoPush = true;
      } catch (err) {
        console.error('Error enviando push forzado:', err.message);
      }
    }

    // Enviar Email
    if (emailUsuario && emailUsuario.trim() !== '') {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: 'Servicio@bicyclecapital.co', pass: 'fyam ecci wqby fhaj' }
        });
        await transporter.sendMail({
          from: 'Servicio@bicyclecapital.co',
          to: emailUsuario,
          subject: subject,
          html: `<p>${message}</p>`
        });
        notificadoEmail = true;
      } catch (err) {
        console.error('Error enviando correo forzado:', err.message);
      }
    }

    // Registrar en Historial
    if (notificadoPush || notificadoEmail) {
      try {
        await historialNotificacionesModels.create({
          hnot_remitente: 'Adelanto Manual Admin',
          hnot_organizacion_id: String(empresaId),
          hnot_titulo: subject,
          hnot_mensaje: message,
          hnot_tipo_mensaje: (notificadoPush && notificadoEmail) ? 'email-push' : (notificadoPush ? 'push' : 'email'),
          hnot_destinatarios: JSON.stringify([emailUsuario || usuario_documento]),
          hnot_destinatarios_conteo: 1,
          hnot_exitosas: (notificadoPush ? 1 : 0) + (notificadoEmail ? 1 : 0),
          hnot_fallidas: 0,
          hnot_fecha_envio: new Date()
        });
      } catch (e) {
        console.error('Error guardando historial forzado:', e.message);
      }
    }

    res.json({
      success: true,
      message: 'Mantenimiento agendado y notificaciones enviadas',
      data: nuevoMantenimiento
    });
  } catch (error) {
    console.error('Error en forzarMantenimiento:', error);
    httpError(res, "ERROR_FORZAR_MANTENIMIENTO");
  }
};

/**
 * Cancela un agendamiento pendiente y programa automáticamente el siguiente vehículo de reemplazo
 */
const cancelarYReemplazarMantenimiento = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { mantenimiento_id, usuario_documento } = req.body;

    if (!mantenimiento_id && !usuario_documento) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: 'mantenimiento_id o usuario_documento es requerido' });
    }

    // 1. Buscar el mantenimiento preventivo a cancelar
    let mantenimiento = null;
    if (mantenimiento_id) {
      mantenimiento = await mantenimientoModels.findByPk(mantenimiento_id);
    } else if (usuario_documento) {
      // Obtener el préstamo personalizado activo del usuario
      const prestamo = await prestamosModels.findOne({
        where: {
          pre_usuario: usuario_documento,
          pre_devolucion_estacion: { [Op.like]: '%Davivienda Torre Sura%' },
          pre_estado: { [Op.like]: '%PRESTAMO PERSONALIZADO%' }
        }
      });

      if (!prestamo) {
        await transaction.rollback();
        return res.status(404).json({ success: false, error: 'No se encontró un préstamo personalizado activo para el usuario con el documento ingresado.' });
      }

      // Buscar mantenimiento activo
      mantenimiento = await mantenimientoModels.findOne({
        where: {
          bicicleta_id: prestamo.pre_bicicleta,
          tipo_mantenimiento: 'preventivo',
          estado: { [Op.in]: ['pendiente', 'en_proceso'] }
        }
      });
    }

    if (!mantenimiento) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: 'No se encontró un agendamiento de mantenimiento preventivo activo para este usuario/vehículo.' });
    }

    if (mantenimiento.estado !== 'pendiente' && mantenimiento.estado !== 'en_proceso') {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: 'Solo se pueden cancelar mantenimientos pendientes o en proceso' });
    }

    // Actualizar estado a cancelado
    await mantenimiento.update({
      estado: 'cancelado',
      comentarios: (mantenimiento.comentarios || '') + ' - Cancelado a solicitud del usuario y reemplazado automáticamente por el sistema.'
    }, { transaction });

    // 2. Buscar la siguiente bicicleta disponible para el reemplazo
    const estacion = await estacionModels.findByPk(mantenimiento.estacion_id);
    const est_estacion = estacion ? estacion.est_estacion : 'Davivienda Torre Sura';

    // Obtener todos los préstamos personalizados activos en esta estación
    const prestamos = await prestamosModels.findAll({
      where: {
        pre_devolucion_estacion: { [Op.like]: `%${est_estacion}%` },
        pre_estado: { [Op.like]: '%PRESTAMO PERSONALIZADO%' }
      }
    });

    if (prestamos.length === 0) {
      await transaction.commit();
      return res.json({
        success: true,
        message: 'Mantenimiento cancelado. No se encontraron vehículos en préstamo personalizado para reemplazo.',
        reemplazo: null
      });
    }

    const bicisAsignadas = prestamos.map(p => ({
      bicicleta_id: p.pre_bicicleta,
      usuario_documento: p.pre_usuario,
      prestamo_id: p.pre_id
    })).filter(item => item.bicicleta_id && item.usuario_documento);

    const bicisIds = bicisAsignadas.map(b => b.bicicleta_id);

    // Mantenimientos activos actuales (excluyendo el que acabamos de cancelar)
    const mantenimientosActivos = await mantenimientoModels.findAll({
      where: {
        bicicleta_id: { [Op.in]: bicisIds },
        tipo_mantenimiento: 'preventivo',
        estado: { [Op.in]: ['pendiente', 'en_proceso'] },
        id: { [Op.ne]: mantenimiento_id }
      },
      transaction
    });

    const bicisIdsExcluir = new Set(mantenimientosActivos.map(m => m.bicicleta_id));
    // También excluimos la bicicleta cancelada de forma temporal para que no sea su propio reemplazo
    bicisIdsExcluir.add(mantenimiento.bicicleta_id);

    const bicisCandidatas = bicisAsignadas.filter(b => !bicisIdsExcluir.has(b.bicicleta_id));

    let reemplazo = null;
    let nuevoMantenimiento = null;

    if (bicisCandidatas.length > 0) {
      // Buscar fechas de último mantenimiento preventivo finalizado
      const candidatasConFecha = [];
      for (const cand of bicisCandidatas) {
        const ultimoMant = await mantenimientoModels.findOne({
          where: {
            bicicleta_id: cand.bicicleta_id,
            tipo_mantenimiento: 'preventivo',
            estado: 'finalizado'
          },
          order: [['fecha_finalizacion', 'DESC']],
          transaction
        });

        candidatasConFecha.push({
          ...cand,
          fecha_ultimo_mantenimiento: ultimoMant ? new Date(ultimoMant.fecha_finalizacion) : new Date(0)
        });
      }

      // Ordenar y tomar la primera
      candidatasConFecha.sort((a, b) => a.fecha_ultimo_mantenimiento - b.fecha_ultimo_mantenimiento);
      reemplazo = candidatasConFecha[0];

      // Crear el mantenimiento preventivo pendiente para el reemplazo
      nuevoMantenimiento = await mantenimientoModels.create({
        empresa_id: mantenimiento.empresa_id,
        bicicleta_id: reemplazo.bicicleta_id,
        operario_id: mantenimiento.operario_id,
        estacion_id: mantenimiento.estacion_id,
        tipo_mantenimiento: 'preventivo',
        estado: 'pendiente',
        prioridad: 'media',
        comentarios: 'Mantenimiento preventivo agendado automáticamente como reemplazo de turno.',
        fecha_creacion: new Date()
      }, { transaction });
    }

    await transaction.commit();

    // Enviar notificación al nuevo usuario asignado
    if (reemplazo && nuevoMantenimiento) {
      try {
        const usuario = await usuarioModels.findOne({ where: { usu_documento: reemplazo.usuario_documento } });
        const tokenMsn = await tokenMsnModels.findOne({ where: { documento: reemplazo.usuario_documento } });
        const nombreUsuario = usuario ? usuario.usu_nombre : 'Usuario';
        const emailUsuario = tokenMsn ? tokenMsn.email : (usuario ? usuario.usu_email : null);
        const pushToken = tokenMsn ? tokenMsn.token : null;

        const subject = "¡Turno de mantenimiento programado! 🚲";
        const message = `Hola ${nombreUsuario}, te informamos de manera amigable que tu vehículo asignado tiene programado su mantenimiento preventivo para la próxima semana. Por favor, acércate a la estación Davivienda Torre Sura para realizar el respectivo mantenimiento preventivo. Si tienes algún inconveniente o no puedes asistir, comunícate con soporte de inmediato para reagendar tu turno. ¡Muchas gracias!`;

        let notificadoPush = false;
        let notificadoEmail = false;

        // Push
        if (pushToken && pushToken.trim() !== '' && pushToken.length > 140) {
          try {
            await admin.messaging().send({
              token: pushToken,
              notification: { title: subject, body: message },
              android: { priority: 'high', notification: { sound: 'default', channelId: 'high_importance_channel' } }
            });
            notificadoPush = true;
          } catch (e) {
            console.error('Error enviando push en reemplazo:', e.message);
          }
        }

        // Email
        if (emailUsuario && emailUsuario.trim() !== '') {
          try {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: { user: 'Servicio@bicyclecapital.co', pass: 'fyam ecci wqby fhaj' }
            });
            await transporter.sendMail({
              from: 'Servicio@bicyclecapital.co',
              to: emailUsuario,
              subject: subject,
              html: `<p>${message}</p>`
            });
            notificadoEmail = true;
          } catch (e) {
            console.error('Error enviando correo en reemplazo:', e.message);
          }
        }
      } catch (notifyErr) {
        console.error('Error en notificaciones de reemplazo:', notifyErr.message);
      }
    }

    res.json({
      success: true,
      message: reemplazo 
        ? 'Mantenimiento cancelado y reemplazado con éxito.' 
        : 'Mantenimiento cancelado, pero no se encontraron vehículos adicionales para el reemplazo.',
      reemplazo: reemplazo ? {
        bicicleta_id: reemplazo.bicicleta_id,
        usuario_documento: reemplazo.usuario_documento,
        mantenimiento_id: nuevoMantenimiento.id
      } : null
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error en cancelarYReemplazarMantenimiento:', error);
    httpError(res, 'ERROR_CANCELAR_Y_REEMPLAZAR_MANTENIMIENTO');
  }
};

/**
 * Ejecutar de manera manual el cron job de selección rotativa semanal
 */
const ejecutarCronManual = async (req, res) => {
  try {
    const result = await programarMantenimientosSemanalesSura();
    res.json(result);
  } catch (error) {
    console.error('Error ejecutando cron manual:', error);
    httpError(res, "ERROR_EJECUTAR_CRON_MANUAL");
  }
};

module.exports = {
  getResumen,
  getProgramados,
  getHistorial,
  enviarRecordatorioManual,
  forzarMantenimiento,
  cancelarYReemplazarMantenimiento,
  ejecutarCronManual
};
