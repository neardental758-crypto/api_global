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

/**
 * Servicio para agendar automáticamente 10 mantenimientos preventivos a la semana
 * para vehículos de Préstamo Personalizado en Davivienda Torre Sura.
 */
async function programarMantenimientosSemanalesSura() {
  console.log('🔄 [MANTENIMIENTO PERSONALIZADO] Iniciando selección semanal...');
  
  try {
    const OPERARIO_DEFECTO = '9732908';
    
    // 1. Obtener información de la estación Davivienda Torre Sura
    const estacion = await estacionModels.findOne({
      where: {
        est_estacion: { [Op.like]: '%Davivienda Torre Sura%' }
      }
    });
    
    if (!estacion) {
      console.error('❌ [MANTENIMIENTO PERSONALIZADO] Estación "Davivienda Torre Sura" no encontrada.');
      return { success: false, message: 'Estación no encontrada' };
    }
    
    // Buscar la empresa de la estación para obtener su ID numérico
    let empresaId = '1';
    if (estacion.est_empresa) {
      const empresa = await empresaModels.findOne({
        where: { emp_nombre: estacion.est_empresa }
      });
      if (empresa) {
        empresaId = empresa.emp_id;
      }
    }
    
    // 2. Obtener préstamos personalizados activos en esta estación
    const prestamos = await prestamosModels.findAll({
      where: {
        pre_devolucion_estacion: { [Op.like]: '%Davivienda Torre Sura%' },
        pre_estado: { [Op.like]: '%PRESTAMO PERSONALIZADO%' }
      }
    });
    
    if (prestamos.length === 0) {
      console.log('ℹ️ [MANTENIMIENTO PERSONALIZADO] No se encontraron vehículos en préstamo personalizado.');
      return { success: true, message: 'Sin vehículos programables', programados: 0 };
    }
    
    console.log(`🚲 [MANTENIMIENTO PERSONALIZADO] Se encontraron ${prestamos.length} vehículos en préstamo personalizado.`);
    
    // Mapear bicicletas asignadas
    const bicisAsignadas = prestamos.map(p => ({
      bicicleta_id: p.pre_bicicleta,
      usuario_documento: p.pre_usuario,
      prestamo_id: p.pre_id
    })).filter(item => item.bicicleta_id && item.usuario_documento);
    
    const bicisIds = bicisAsignadas.map(b => b.bicicleta_id);
    
    // 3. Excluir bicicletas que ya tengan un mantenimiento preventivo activo (pendiente o en_proceso)
    const mantenimientosActivos = await mantenimientoModels.findAll({
      where: {
        bicicleta_id: { [Op.in]: bicisIds },
        tipo_mantenimiento: 'preventivo',
        estado: { [Op.in]: ['pendiente', 'en_proceso'] }
      }
    });
    
    const bicisIdsExcluir = new Set(mantenimientosActivos.map(m => m.bicicleta_id));
    const bicisCandidatas = bicisAsignadas.filter(b => !bicisIdsExcluir.has(b.bicicleta_id));
    
    if (bicisCandidatas.length === 0) {
      console.log('ℹ️ [MANTENIMIENTO PERSONALIZADO] Todos los vehículos ya tienen mantenimientos preventivos pendientes o en curso.');
      return { success: true, message: 'Todos los vehículos tienen procesos activos', programados: 0 };
    }
    
    console.log(`🔍 [MANTENIMIENTO PERSONALIZADO] ${bicisCandidatas.length} vehículos listos para evaluar.`);
    
    // 4. Buscar la fecha de finalización del último mantenimiento preventivo finalizado
    const candidatasConFecha = [];
    for (const cand of bicisCandidatas) {
      const ultimoMant = await mantenimientoModels.findOne({
        where: {
          bicicleta_id: cand.bicicleta_id,
          tipo_mantenimiento: 'preventivo',
          estado: 'finalizado'
        },
        order: [['fecha_finalizacion', 'DESC']]
      });
      
      candidatasConFecha.push({
        ...cand,
        fecha_ultimo_mantenimiento: ultimoMant ? new Date(ultimoMant.fecha_finalizacion) : new Date(0) // 1970
      });
    }
    
    // 5. Ordenar por la fecha del último mantenimiento de forma ascendente (más antiguas primero)
    candidatasConFecha.sort((a, b) => a.fecha_ultimo_mantenimiento - b.fecha_ultimo_mantenimiento);
    
    // Límite estricto de negocio: Máximo 10 mantenimientos preventivos activos de forma simultánea.
    // Calculamos el cupo disponible restando los que ya están activos (pendiente/en_proceso)
    const cupoDisponible = 10 - mantenimientosActivos.length;
    
    if (cupoDisponible <= 0) {
      console.log('ℹ️ [MANTENIMIENTO PERSONALIZADO] El cupo de 10 mantenimientos activos simultáneos ya está completo.');
      return { 
        success: true, 
        message: `El cupo semanal de 10 mantenimientos activos ya está completo (${mantenimientosActivos.length} activos). No se agendaron nuevos vehículos.`, 
        programados: 0 
      };
    }
    
    // Tomar solo las necesarias para completar los 10 cupos
    const elegidas = candidatasConFecha.slice(0, cupoDisponible);
    console.log(`📝 [MANTENIMIENTO PERSONALIZADO] Cupo disponible: ${cupoDisponible}. Se seleccionaron ${elegidas.length} vehículos para programar.`);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'Servicio@bicyclecapital.co',
        pass: 'fyam ecci wqby fhaj'
      }
    });
    
    const resultados = [];
    
    // 6. Procesar cada bicicleta seleccionada
    for (const elegida of elegidas) {
      try {
        // A. Crear el mantenimiento preventivo pendiente
        const nuevoMantenimiento = await mantenimientoModels.create({
          empresa_id: String(empresaId),
          bicicleta_id: elegida.bicicleta_id,
          operario_id: OPERARIO_DEFECTO,
          estacion_id: String(estacion.est_id),
          tipo_mantenimiento: 'preventivo',
          estado: 'pendiente',
          prioridad: 'media',
          comentarios: 'Mantenimiento preventivo programado automáticamente por el sistema para Préstamos Personalizados.',
          fecha_creacion: new Date()
        });
        
        // B. Buscar datos del usuario
        const usuario = await usuarioModels.findOne({
          where: { usu_documento: elegida.usuario_documento }
        });
        
        const tokenMsn = await tokenMsnModels.findOne({
          where: { documento: elegida.usuario_documento }
        });
        
        const nombreUsuario = usuario ? usuario.usu_nombre : 'Usuario';
        const emailUsuario = tokenMsn ? tokenMsn.email : null;
        const pushToken = tokenMsn ? tokenMsn.token : null;
        
        const subject = "¡Turno de mantenimiento programado! 🚲";
        const message = `Hola ${nombreUsuario}, te informamos de manera amigable que tu vehículo asignado tiene programado su mantenimiento preventivo para la próxima semana. Por favor, acércate a la estación Davivienda Torre Sura para realizar el respectivo mantenimiento preventivo. Si tienes algún inconveniente o no puedes asistir, comunícate con soporte de inmediato para reagendar tu turno. ¡Muchas gracias!`;
        
        let notificadoPush = false;
        let notificadoEmail = false;
        
        // C. Enviar Push Notification
        if (pushToken && pushToken.trim() !== '' && pushToken.length > 140) {
          try {
            const messageId = `msg_maint_${Date.now()}_${elegida.usuario_documento}`;
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
            console.log(`📲 [MANTENIMIENTO PERSONALIZADO] Push enviado con éxito a ${nombreUsuario} (${elegida.usuario_documento})`);
          } catch (pushError) {
            console.error(`❌ [MANTENIMIENTO PERSONALIZADO] Error al enviar Push a ${nombreUsuario}:`, pushError.message);
          }
        }
        
        // D. Enviar Email
        if (emailUsuario && emailUsuario.trim() !== '') {
          try {
            const emailOptions = {
              from: 'Servicio@bicyclecapital.co',
              to: emailUsuario,
              subject: subject,
              html: `<p>${message}</p>`
            };
            
            await transporter.sendMail(emailOptions);
            notificadoEmail = true;
            console.log(`📧 [MANTENIMIENTO PERSONALIZADO] Correo enviado con éxito a ${emailUsuario}`);
          } catch (emailError) {
            console.error(`❌ [MANTENIMIENTO PERSONALIZADO] Error al enviar correo a ${emailUsuario}:`, emailError.message);
          }
        }
        
        // E. Guardar en el Historial de Notificaciones
        if (notificadoPush || notificadoEmail) {
          try {
            await historialNotificacionesModels.create({
              hnot_remitente: 'Programador Automático',
              hnot_organizacion_id: String(empresaId),
              hnot_titulo: subject,
              hnot_mensaje: message,
              hnot_tipo_mensaje: (notificadoPush && notificadoEmail) ? 'email-push' : (notificadoPush ? 'push' : 'email'),
              hnot_destinatarios: JSON.stringify([emailUsuario || elegida.usuario_documento]),
              hnot_destinatarios_conteo: 1,
              hnot_exitosas: (notificadoPush ? 1 : 0) + (notificadoEmail ? 1 : 0),
              hnot_fallidas: (!notificadoPush && pushToken ? 1 : 0) + (!notificadoEmail && emailUsuario ? 1 : 0),
              hnot_fecha_envio: new Date()
            });
          } catch (dbError) {
            console.error('❌ [MANTENIMIENTO PERSONALIZADO] Error al guardar historial de notificación:', dbError.message);
          }
        }
        
        resultados.push({
          bicicleta_id: elegida.bicicleta_id,
          usuario_documento: elegida.usuario_documento,
          mantenimiento_id: nuevoMantenimiento.id,
          notificadoPush,
          notificadoEmail
        });
        
      } catch (itemError) {
        console.error(`❌ [MANTENIMIENTO PERSONALIZADO] Error al procesar bicicleta ${elegida.bicicleta_id}:`, itemError.message);
      }
    }
    
    return {
      success: true,
      message: `Proceso completado. Se programaron ${resultados.length} mantenimientos.`,
      programados: resultados.length,
      data: resultados
    };
    
  } catch (err) {
    console.error('❌ [MANTENIMIENTO PERSONALIZADO] Error general en el servicio:', err);
    return { success: false, error: err.message };
  }
}

module.exports = { programarMantenimientosSemanalesSura };
