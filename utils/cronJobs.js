const cron = require('node-cron');
const SesionUsuario = require('../models/mysql/sesionUsuario');
const { 
  agendamientoOperarioModels, 
  agendamientoIncumplidoModels, 
  estacionModels, 
  mantenimientoModels, 
  reservasModels, 
  bicicletasModels, 
  rentaParqueoModels, 
  reservasParqueoModels, 
  lugarParqueoModels,
  prestamosModels,
  tokenMsnModels,
  usuarioModels
} = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');
const nodemailer = require('nodemailer');
const admin = require('../config/firebase');

const startSessionCleanup = () => {
  cron.schedule('0 */6 * * *', async () => {
    try {
      const now = new Date();
      const localTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
      const sixHoursAgo = new Date(localTime.getTime() - (6 * 60 * 60 * 1000));
      
      await SesionUsuario.update(
        { fecha_cierre: localTime },
        {
          where: {
            fecha_cierre: null,
            fecha_ingreso: { [Op.lt]: sixHoursAgo }
          }
        }
      );
    } catch (error) {
      console.error('Error cerrando sesiones:', error);
    }
  });
};

const verificarIncumplimientosAgendamientos = async () => {
  try {
    const ahoraUTC = new Date();
    const ahora = new Date(ahoraUTC.getTime() - (5 * 60 * 60 * 1000));
    
    const ayer = new Date(ahora);
    ayer.setUTCDate(ayer.getUTCDate() - 1);
    
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaAyer = diasSemana[ayer.getUTCDay()];
    
    const inicioAyer = new Date(ayer);
    inicioAyer.setUTCHours(0, 0, 0, 0);
    
    const finAyer = new Date(ayer);
    finAyer.setUTCHours(23, 59, 59, 999);
    
    const agendamientosActivos = await agendamientoOperarioModels.findAll({
      where: {
        activo: true,
        dias_semana: {
          [Op.like]: `%${diaAyer}%`
        }
      },
      include: [{
        model: estacionModels,
        attributes: ['est_id', 'est_estacion']
      }]
    });
    
    const operarioIds = agendamientosActivos.map(ag => ag.operario_id);
    const estacionIds = agendamientosActivos
      .map(ag => ag.bc_estacione?.est_id?.toString())
      .filter(id => id);
    
    const mantenimientos = await mantenimientoModels.findAll({
      where: {
        operario_id: { [Op.in]: operarioIds },
        estacion_id: { [Op.in]: estacionIds },
        fecha_creacion: {
          [Op.between]: [inicioAyer, finAyer]
        }
      }
    });
    
    const incumplidosExistentes = await agendamientoIncumplidoModels.findAll({
      where: {
        agendamiento_id: { [Op.in]: agendamientosActivos.map(ag => ag.id) },
        fecha_incumplimiento: {
          [Op.between]: [inicioAyer, finAyer]
        }
      }
    });
    
    const mantenimientoMap = new Map();
    mantenimientos.forEach(m => {
      const key = `${m.operario_id}-${m.estacion_id}`;
      if (!mantenimientoMap.has(key)) {
        mantenimientoMap.set(key, []);
      }
      mantenimientoMap.get(key).push(m);
    });
    
    const incumplidoMap = new Map();
    incumplidosExistentes.forEach(inc => {
      incumplidoMap.set(inc.agendamiento_id, inc);
    });
    
    const incumplidosACrear = [];
    const incumplidosAEliminar = [];
    
    for (const ag of agendamientosActivos) {
      const estacion = ag.bc_estacione;
      
      if (!estacion) {
        continue;
      }
      
      const key = `${ag.operario_id}-${estacion.est_id}`;
      const tieneMantenimientos = mantenimientoMap.has(key) && mantenimientoMap.get(key).length > 0;
      const incumplidoExistente = incumplidoMap.get(ag.id);
      
      if (!tieneMantenimientos && !incumplidoExistente) {
        incumplidosACrear.push({
          agendamiento_id: ag.id,
          operario_id: ag.operario_id,
          estacion_id: ag.estacion_id,
          empresa_id: ag.empresa_id,
          dia_semana: diaAyer,
          fecha_incumplimiento: ayer
        });
      } else if (tieneMantenimientos && incumplidoExistente) {
        incumplidosAEliminar.push(incumplidoExistente.id);
      }
    }
    
    if (incumplidosACrear.length > 0) {
      await agendamientoIncumplidoModels.bulkCreate(incumplidosACrear);
    }
    
    if (incumplidosAEliminar.length > 0) {
      await agendamientoIncumplidoModels.destroy({
        where: { id: { [Op.in]: incumplidosAEliminar } }
      });
    }
    
  } catch (error) {
    console.error('Error verificando incumplimientos:', error);
  }
};

const startAgendamientosCleanup = () => {
  cron.schedule('0 1 * * *', verificarIncumplimientosAgendamientos);
};

const startReservationsCleanup = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const reservas = await reservasModels.findAll({ where: { res_estado: 'ACTIVA' } });
      
      const ahoraUTC = new Date();
      // Ajustamos a la zona horaria en la que parece operar la app internamente (-5 horas)
      const ahoraBogota = new Date(ahoraUTC.getTime() - (5 * 60 * 60 * 1000));

      for (const res of reservas) {
        if (!res.res_fecha_fin || !res.res_hora_fin) continue;

        const [año, mes, dia] = res.res_fecha_fin.split('-');
        let partesHora = res.res_hora_fin.split(':');
        const hora = partesHora[0];
        const min = partesHora[1];
        const seg = partesHora.length > 2 ? partesHora[2] : 0;
        
        const reservaTime = Date.UTC(año, parseInt(mes) - 1, dia, hora, min, seg);
        const currentTime = Date.UTC(
            ahoraBogota.getUTCFullYear(),
            ahoraBogota.getUTCMonth(),
            ahoraBogota.getUTCDate(),
            ahoraBogota.getUTCHours(),
            ahoraBogota.getUTCMinutes(),
            ahoraBogota.getUTCSeconds()
        );

        if (currentTime >= reservaTime) {
          await reservasModels.update(
            { res_estado: 'CANCELADA' },
            { where: { res_id: res.res_id, res_estado: 'ACTIVA' } }
          );
          
          if (res.res_bicicleta) {
            await bicicletasModels.update(
              { bic_estado: 'DISPONIBLE' },
              { where: { bic_id: res.res_bicicleta } }
            );
          }
          console.log(`❌ Reserva ${res.res_id} cancelada automáticamente por tiempo expirado (CRON)`);
        }
      }
    } catch (error) {
      console.error('Error en cron de reservas:', error);
    }
  });
};

const parseRentaTime = (fechaStr, finStr) => {
  if (!fechaStr || !finStr) return null;

  let fechaParte = fechaStr;
  if (fechaStr.includes('T')) {
    fechaParte = fechaStr.split('T')[0];
  } else if (fechaStr.includes(' ')) {
    fechaParte = fechaStr.split(' ')[0];
  }

  let año, mes, dia;
  if (fechaParte.includes('-')) {
    const partes = fechaParte.split('-');
    if (partes[0].length === 4) {
      [año, mes, dia] = partes.map(Number);
    } else {
      [dia, mes, año] = partes.map(Number);
    }
  } else if (fechaParte.includes('/')) {
    const partes = fechaParte.split('/');
    if (partes[0].length === 4) {
      [año, mes, dia] = partes.map(Number);
    } else {
      [dia, mes, año] = partes.map(Number);
    }
  } else {
    const d = new Date(fechaStr);
    if (!isNaN(d.getTime())) {
      año = d.getFullYear();
      mes = d.getMonth() + 1;
      dia = d.getDate();
    } else {
      return null;
    }
  }

  const partesHora = finStr.split(':');
  const hora = parseInt(partesHora[0], 10) || 0;
  const min = parseInt(partesHora[1], 10) || 0;
  const seg = partesHora.length > 2 ? parseInt(partesHora[2], 10) : 0;

  return Date.UTC(año, mes - 1, dia, hora, min, seg);
};

const limpiarParqueoNocturno = async () => {
  try {
    console.log('🔄 [CRON] Iniciando limpieza nocturna de parqueaderos (ElectroHub)...');

    // 1. Cancelar reservas de parqueo que sigan activas
    const [reservasActualizadas] = await reservasParqueoModels.update(
      { estado: 'CANCELADA' },
      { where: { estado: 'ACTIVA' } }
    );
    if (reservasActualizadas > 0) {
      console.log(`❌ [CRON] Se cancelaron ${reservasActualizadas} reservas de parqueo activas.`);
    }

    // 2. Finalizar rentas de parqueo que sigan activas
    const [rentasActualizadas] = await rentaParqueoModels.update(
      { estado: 'FINALIZADA' },
      { where: { estado: 'ACTIVA' } }
    );
    if (rentasActualizadas > 0) {
      console.log(`✅ [CRON] Se finalizaron ${rentasActualizadas} rentas de parqueo activas.`);
    }

    // 3. Dejar los lugares de parqueo ocupados o reservados en DISPONIBLE
    const [lugaresActualizados] = await lugarParqueoModels.update(
      { estado: 'DISPONIBLE' },
      { 
        where: { 
          estado: { 
            [Op.in]: ['OCUPADO', 'RESERVADO'] 
          } 
        } 
      }
    );
    if (lugaresActualizados > 0) {
      console.log(`🚲 [CRON] Se liberaron ${lugaresActualizados} lugares de parqueo.`);
    }

    console.log('🏁 [CRON] Limpieza nocturna de parqueaderos (ElectroHub) completada.');
  } catch (error) {
    console.error('❌ [CRON] Error en la limpieza nocturna de parqueaderos:', error);
  }
};

const verificarVencimientosParqueo = async () => {
  try {
    console.log('🔄 [CRON] Iniciando control de vencimientos de parqueaderos...');
    const rentasActivas = await rentaParqueoModels.findAll({
      where: { estado: 'ACTIVA' }
    });

    const ahoraUTC = new Date();
    // Ajustamos a la zona horaria en la que parece operar la app internamente (-5 horas)
    const ahoraBogota = new Date(ahoraUTC.getTime() - (5 * 60 * 60 * 1000));

    const currentTime = Date.UTC(
      ahoraBogota.getUTCFullYear(),
      ahoraBogota.getUTCMonth(),
      ahoraBogota.getUTCDate(),
      ahoraBogota.getUTCHours(),
      ahoraBogota.getUTCMinutes(),
      ahoraBogota.getUTCSeconds()
    );

    let contadorVencidos = 0;

    for (const rent of rentasActivas) {
      const rentaTime = parseRentaTime(rent.fecha, rent.fin);
      if (!rentaTime) continue;

      if (currentTime >= rentaTime) {
        // Finalizar renta
        await rentaParqueoModels.update(
          { estado: 'FINALIZADA' },
          { where: { id: rent.id } }
        );

        // Liberar lugar de parqueo
        if (rent.lugar_parqueo) {
          await lugarParqueoModels.update(
            { estado: 'DISPONIBLE' },
            { where: { id: rent.lugar_parqueo } }
          );
        }
        console.log(`✅ [CRON] Renta ${rent.id} vencida finalizada y espacio ${rent.lugar_parqueo} liberado.`);
        contadorVencidos++;
      }
    }

    if (contadorVencidos > 0) {
      console.log(`🏁 [CRON] Finalizadas ${contadorVencidos} rentas de parqueo vencidas.`);
    }
  } catch (error) {
    console.error('❌ [CRON] Error en el control de vencimientos de parqueaderos:', error);
  }
};

const startParqueoNocturnoCleanup = () => {
  cron.schedule('0 0 * * *', limpiarParqueoNocturno);
};

const startParqueoVencimientoCleanup = () => {
  cron.schedule('0 7-21 * * *', verificarVencimientosParqueo);
};

const verificarPrestamosVencidos = async () => {
  try {
    console.log('🔄 [CRON] Iniciando control de préstamos vencidos...');
    const ahora = new Date();

    // Query active loans that are expired and have not been notified
    const prestamosVencidos = await prestamosModels.findAll({
      where: {
        pre_estado: 'ACTIVA',
        pre_devolucion_fecha: {
          [Op.lte]: ahora,
          [Op.ne]: null
        },
        [Op.or]: [
          { pre_finalizado_por: null },
          { 
            pre_finalizado_por: {
              [Op.notLike]: 'NOTIFICADO_VENCIDO_%'
            }
          }
        ]
      }
    });

    if (prestamosVencidos.length === 0) {
      console.log('🏁 [CRON] No hay préstamos vencidos pendientes de notificación.');
      return;
    }

    console.log(`🚲 [CRON] Se encontraron ${prestamosVencidos.length} préstamos vencidos. Enviando recordatorios...`);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'Servicio@bicyclecapital.co',
        pass: 'fyam ecci wqby fhaj'
      }
    });

    for (const prestamo of prestamosVencidos) {
      try {
        const userToken = await tokenMsnModels.findOne({
          where: { documento: prestamo.pre_usuario },
          include: [{
            model: usuarioModels,
            attributes: ['usu_nombre'],
            as: 'bc_usuario'
          }]
        });

        if (!userToken) {
          console.log(`⚠️ [CRON] No se encontró token/email para el usuario ${prestamo.pre_usuario}. Marcando prestamo en pre_finalizado_por para evitar bucle.`);
          await prestamosModels.update(
            { pre_finalizado_por: `NOTIFICADO_VENCIDO_NO_TOKEN_${new Date().toISOString()}` },
            { where: { pre_id: prestamo.pre_id } }
          );
          continue;
        }

        const nombreUsuario = userToken.bc_usuario ? userToken.bc_usuario.usu_nombre : 'Usuario';
        const emailUsuario = userToken.email;
        const pushToken = userToken.token;

        const subject = "¡Recordatorio de entrega de vehículo! 🚲";
        const message = `Hola ${nombreUsuario}, te recordamos de manera amigable que el tiempo de tu préstamo de bicicleta ha terminado y debes entregar el vehículo. ¡Muchas gracias por tu colaboración!`;

        let notificacionEnviada = false;

        // 1. Send Firebase Push Notification if token exists
        if (pushToken && pushToken.trim() !== '' && pushToken.length > 140) {
          try {
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
            console.log(`📲 [CRON] Push enviado con éxito a ${nombreUsuario} (${prestamo.pre_usuario})`);
            notificacionEnviada = true;
          } catch (pushError) {
            console.error(`❌ [CRON] Error al enviar Push a ${nombreUsuario}:`, pushError.message);
          }
        }

        // 2. Send Nodemailer Email
        if (emailUsuario && emailUsuario.trim() !== '') {
          try {
            const emailOptions = {
              from: 'Servicio@bicyclecapital.co',
              to: emailUsuario,
              subject: subject,
              html: `<p>${message}</p>`
            };

            await transporter.sendMail(emailOptions);
            console.log(`📧 [CRON] Correo enviado con éxito a ${emailUsuario}`);
            notificacionEnviada = true;
          } catch (emailError) {
            console.error(`❌ [CRON] Error al enviar correo a ${emailUsuario}:`, emailError.message);
          }
        }

        // Mark as notified by setting pre_finalizado_por
        await prestamosModels.update(
          { pre_finalizado_por: `NOTIFICADO_VENCIDO_${new Date().toISOString()}` },
          { where: { pre_id: prestamo.pre_id } }
        );

      } catch (userError) {
        console.error(`❌ [CRON] Error procesando préstamo ${prestamo.pre_id} para usuario ${prestamo.pre_usuario}:`, userError.message);
      }
    }

    console.log('🏁 [CRON] Control de préstamos vencidos finalizado.');
  } catch (error) {
    console.error('❌ [CRON] Error crítico en control de vencimientos de préstamos:', error);
  }
};

const startPrestamosVencidosNotification = () => {
  cron.schedule('0 17 * * *', verificarPrestamosVencidos);
};

module.exports = { 
  startSessionCleanup, 
  startAgendamientosCleanup, 
  startReservationsCleanup, 
  verificarIncumplimientosAgendamientos,
  startParqueoNocturnoCleanup,
  startParqueoVencimientoCleanup,
  limpiarParqueoNocturno,
  verificarVencimientosParqueo,
  startPrestamosVencidosNotification,
  verificarPrestamosVencidos
};