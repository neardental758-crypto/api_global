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
  usuarioModels,
  historialNotificacionesModels,
  notificacionesProgramadasModels
} = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');
const nodemailer = require('nodemailer');
const admin = require('../config/firebase');
const moment = require('moment');
const { programarMantenimientosSemanalesSura } = require('../services/mantenimientoPersonalizado');


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
    const ahora = new Date(new Date().getTime() - (5 * 60 * 60 * 1000));

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

        const fechaInicio = prestamo.pre_retiro_fecha ? moment.utc(prestamo.pre_retiro_fecha).format('DD/MM/YYYY') : '';
        const horaInicio = prestamo.pre_retiro_hora || '';
        const fechaFin = prestamo.pre_devolucion_fecha ? moment.utc(prestamo.pre_devolucion_fecha).format('DD/MM/YYYY') : '';
        const horaFin = prestamo.pre_devolucion_hora || '';

        const subject = "¡Recordatorio de entrega de vehículo! 🚲";
        const message = `Hola ${nombreUsuario}, te recordamos de manera amigable que el tiempo de tu préstamo de bicicleta ha terminado y debes entregar el vehículo.

Detalles del préstamo:
- Inicio: ${fechaInicio} a las ${horaInicio}
- Vencimiento: ${fechaFin} a las ${horaFin}

Si deseas extender el préstamo, puedes hacerlo desde el chatbot de la aplicación ingresando a la opción "Extensión Prestamos". ¡Muchas gracias por tu colaboración!`;

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
              html: `<p>${message.replace(/\n/g, '<br>')}</p>`
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
  cron.schedule('0 22 * * *', verificarPrestamosVencidos);
};

const verificarNotificacionesProgramadas = async () => {
  try {
    const ahoraUTC = new Date();
    // Ajustar a la hora de Bogotá (-5 horas)
    const ahoraBogota = new Date(ahoraUTC.getTime() - (5 * 60 * 60 * 1000));
    
    const año = ahoraBogota.getUTCFullYear();
    const mes = String(ahoraBogota.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(ahoraBogota.getUTCDate()).padStart(2, '0');
    const fechaHoyStr = `${año}-${mes}-${dia}`; // 'YYYY-MM-DD'
    
    const hora = String(ahoraBogota.getUTCHours()).padStart(2, '0');
    const minutos = String(ahoraBogota.getUTCMinutes()).padStart(2, '0');
    const horaHoyStr = `${hora}:${minutos}`; // 'HH:MM'
    
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemanaHoy = diasSemana[ahoraBogota.getUTCDay()];
    
    console.log(`⏰ [CRON NOTIFICACIONES] Verificando para fecha: ${fechaHoyStr}, hora: ${horaHoyStr}, día: ${diaSemanaHoy}`);

    // Buscar notificaciones programadas activas (PENDIENTE)
    const programadas = await notificacionesProgramadasModels.findAll({
      where: {
        prog_estado: 'PENDIENTE'
      }
    });

    const matchingTasks = [];

    for (const task of programadas) {
      if (task.prog_es_recurrente) {
        // Recurrente: Verificar si el día de hoy coincide con los días programados y la hora coincide
        const diasProgramados = task.prog_dia_semana ? task.prog_dia_semana.split(',').map(d => d.trim().toLowerCase()) : [];
        if (diasProgramados.includes(diaSemanaHoy) && task.prog_hora <= horaHoyStr) {
          // Verificar que no se haya ejecutado ya hoy
          const ultimaEjecucion = task.prog_ultima_ejecucion ? new Date(task.prog_ultima_ejecucion) : null;
          if (!ultimaEjecucion || (ahoraBogota.getUTCDate() !== ultimaEjecucion.getDate() || ahoraBogota.getUTCMonth() !== ultimaEjecucion.getMonth() || ahoraBogota.getUTCFullYear() !== ultimaEjecucion.getFullYear())) {
            matchingTasks.push(task);
          }
        }
      } else {
        // Única vez: Verificar que la fecha programada sea <= hoy y la hora programada sea <= ahora
        if (task.prog_fecha <= fechaHoyStr && task.prog_hora <= horaHoyStr) {
          matchingTasks.push(task);
        }
      }
    }

    if (matchingTasks.length === 0) {
      return;
    }

    console.log(`🚀 [CRON NOTIFICACIONES] Se encontraron ${matchingTasks.length} tareas programadas para ejecutar.`);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'Servicio@bicyclecapital.co',
        pass: 'fyam ecci wqby fhaj'
      }
    });

    const fs = require('fs');
    const path = require('path');
    let firmaBase64 = '';
    try {
      const firmaPath = path.join(__dirname, '../assets/firma_milena.jpg');
      if (fs.existsSync(firmaPath)) {
        firmaBase64 = fs.readFileSync(firmaPath).toString('base64');
      }
    } catch (e) {
      console.log('Firma no disponible:', e.message);
    }

    for (const task of matchingTasks) {
      try {
        // Cambiar estado a PROCESANDO para evitar doble ejecución
        await notificacionesProgramadasModels.update(
          { prog_estado: 'PROCESANDO' },
          { where: { prog_id: task.prog_id } }
        );

        let targetUsers = [];
        const organizationId = task.prog_organizacion_id;
        const sendToType = task.prog_send_to_type;
        const filterType = task.prog_filter_type;
        const selectedEstacion = task.prog_selected_estacion;
        
        let recipientIds = [];
        try {
          recipientIds = JSON.parse(task.prog_destinatarios || '[]');
        } catch (e) {
          recipientIds = [];
        }

        // Cargar usuarios destinatarios
        const Empresa = require('../models/mysql/empresa');
        const TokenMsn = require('../models/mysql/tokenMsn');
        const Usuario = require('../models/mysql/usuario');
        const Prestamos = require('../models/mysql/prestamos');

        const empresa = await Empresa.findOne({
          where: { emp_id: organizationId }
        });

        if (!empresa) {
          console.log(`❌ [CRON NOTIFICACIONES] Empresa no encontrada para ID: ${organizationId}`);
          await notificacionesProgramadasModels.update(
            { prog_estado: 'FALLIDO', prog_ultima_ejecucion: ahoraUTC },
            { where: { prog_id: task.prog_id } }
          );
          continue;
        }

        // Obtener todos los tokens/usuarios de la empresa
        const allEmpresaUsers = await TokenMsn.findAll({
          include: [{
            model: Usuario,
            where: { usu_empresa: empresa.emp_nombre },
            attributes: ['usu_nombre', 'usu_ciudad', 'usu_empresa', 'usu_dir_trabajo', 'usu_habilitado'],
            as: 'bc_usuario'
          }],
          attributes: ['documento', 'email', 'token']
        });

        // Filtrar según el tipo de envío y filtros seleccionados
        let filteredUsers = [...allEmpresaUsers];

        // 1. Filtrar por tipo de destinatario (seleccionados, estación o todos)
        if (sendToType === 'selected' && recipientIds.length > 0) {
          filteredUsers = filteredUsers.filter(u => recipientIds.includes(u.documento));
        } else if (sendToType === 'station' && selectedEstacion) {
          // Filtrar por estación
          const Estacion = require('../models/mysql/estacion');
          const estacionSeleccionada = await Estacion.findOne({
            where: { est_estacion: selectedEstacion }
          });
          if (estacionSeleccionada) {
            filteredUsers = filteredUsers.filter(
              (user) => user.bc_usuario && user.bc_usuario.usu_dir_trabajo === estacionSeleccionada.est_direccion
            );
          }
        }

        // 2. Filtrar por estado del usuario (nuevos, activos, etc.)
        if (filterType !== 'all') {
          const userDocumentos = filteredUsers.map(u => u.documento);
          
          if (filterType === 'nuevos') {
            filteredUsers = filteredUsers.filter(u => u.bc_usuario && u.bc_usuario.usu_habilitado === 0);
          } else if (filterType === 'activos') {
            filteredUsers = filteredUsers.filter(u => u.bc_usuario && u.bc_usuario.usu_habilitado === 1);
          } else if (filterType === 'prestamos' || filterType === 'personalizados') {
            const estadosBuscar = filterType === 'prestamos' ? ['ACTIVA', 'PRESTAMO DE EMERGENCIA'] : ['PRESTAMO PERSONALIZADO'];
            const prestamosActivos = await Prestamos.findAll({
              where: {
                pre_usuario: { [Op.in]: userDocumentos },
                pre_estado: { [Op.ne]: null },
                [Op.or]: [
                  { pre_estado: { [Op.in]: estadosBuscar } },
                  { pre_estado: { [Op.in]: estadosBuscar.map(e => e.toLowerCase()) } }
                ]
              },
              attributes: ['pre_usuario'],
              group: ['pre_usuario']
            });
            const docsConPrestamo = new Set(prestamosActivos.map(p => p.pre_usuario));
            filteredUsers = filteredUsers.filter(u => docsConPrestamo.has(u.documento));
          }
        }

        if (filteredUsers.length === 0) {
          console.log(`⚠️ [CRON NOTIFICACIONES] No hay usuarios destinatarios para la tarea: ${task.prog_id}`);
          await notificacionesProgramadasModels.update(
            { prog_estado: task.prog_es_recurrente ? 'PENDIENTE' : 'ENVIADO', prog_ultima_ejecucion: ahoraUTC },
            { where: { prog_id: task.prog_id } }
          );
          continue;
        }

        const emailResults = [];
        const pushResults = [];

        // Ejecutar envíos
        for (const user of filteredUsers) {
          const messageType = task.prog_tipo_mensaje;
          const subject = task.prog_titulo;
          const message = task.prog_mensaje;
          const imageUrl = task.prog_image_url;

          // 1. Enviar Email
          if (['email', 'email-push', 'email-in-app', 'all'].includes(messageType)) {
            try {
              let emailOptions = { 
                from: 'Servicio@bicyclecapital.co',
                to: user.email,
                subject: subject,
                text: message
              };
              
              const attachments = [];
              if (firmaBase64) {
                attachments.push({
                  filename: 'firma.png',
                  content: firmaBase64,
                  encoding: 'base64',
                  cid: 'firma'
                });
              }

              if (imageUrl && imageUrl.startsWith('data:image')) {
                attachments.push({
                  filename: 'imagen.png',
                  content: imageUrl.split(',')[1],
                  encoding: 'base64',
                  cid: 'imagen'
                });
                emailOptions.html = `<p>${message}</p><img src="cid:imagen" style="max-width: 200px;"><br><br>${firmaBase64 ? '<img src="cid:firma" style="max-width: 400px; width: 100%;">' : ''}`;
              } else if (imageUrl) {
                emailOptions.html = `<p>${message}</p><img src="${imageUrl}" style="max-width: 200px;"><br><br>${firmaBase64 ? '<img src="cid:firma" style="max-width: 400px; width: 100%;">' : ''}`;
              } else if (firmaBase64) {
                emailOptions.html = `<p>${message}</p><br><br><img src="cid:firma" style="max-width: 400px; width: 100%;">`;
              }

              if (attachments.length > 0) {
                emailOptions.attachments = attachments;
              }
              
              await transporter.sendMail(emailOptions);
              emailResults.push({ documento: user.documento, success: true, type: 'email' });
            } catch (emailError) {
              emailResults.push({ documento: user.documento, success: false, type: 'email', error: emailError.message });
            }
          }

          // 2. Enviar Push
          if (['push', 'email-push', 'in-app', 'push-in-app', 'email-in-app', 'all'].includes(messageType)) {
            if (user.token && user.token.trim() !== '' && user.token.length > 140) {
              try {
                const messageId = `msg_${Date.now()}_${user.documento}`;
                const pushMessage = {
                  token: user.token,
                  notification: {
                    title: subject || 'Notificación',
                    body: message || 'Mensaje',
                    ...(imageUrl ? { image: imageUrl } : {})
                  },
                  android: {
                    priority: 'high',
                    notification: {
                      sound: 'default',
                      channelId: 'high_importance_channel',
                      ...(imageUrl ? { image: imageUrl } : {})
                    },
                    data: {
                      click_action: 'FLUTTER_NOTIFICATION_CLICK',
                      messageType: messageType,
                      messageId: messageId,
                      isInApp: ['in-app', 'push-in-app', 'email-in-app', 'all'].includes(messageType).toString(),
                      ...(imageUrl ? { imageUrl: imageUrl } : {})
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
                          title: subject || 'Notificación',
                          body: message || 'Mensaje'
                        },
                        sound: 'default',
                        badge: 1,
                        contentAvailable: true
                      }
                    },
                    fcmOptions: {
                      ...(imageUrl ? { image: imageUrl } : {})
                    }
                  },
                  data: {
                    messageType: messageType,
                    messageId: messageId,
                    isInApp: ['in-app', 'push-in-app', 'email-in-app', 'all'].includes(messageType).toString(),
                    timestamp: Date.now().toString(),
                    ...(imageUrl ? { imageUrl: imageUrl } : {})
                  }
                };

                const pushResponse = await admin.messaging().send(pushMessage);
                pushResults.push({ documento: user.documento, success: true, type: 'push', messageId: pushResponse });
              } catch (pushError) {
                pushResults.push({ documento: user.documento, success: false, type: 'push', error: pushError.message });
              }
            } else {
              pushResults.push({ documento: user.documento, success: false, type: 'push', error: 'Token no disponible' });
            }
          }
          await new Promise(resolve => setTimeout(resolve, 150));
        }

        const allResults = [...emailResults, ...pushResults];
        const successCount = allResults.filter(r => r.success).length;
        const failCount = allResults.filter(r => !r.success).length;

        // Guardar en el historial
        try {
          const recipientList = filteredUsers.map(u => u.email || u.documento);
          await historialNotificacionesModels.create({
            hnot_remitente: task.prog_remitente || 'Programador Automático',
            hnot_organizacion_id: organizationId,
            hnot_titulo: task.prog_titulo,
            hnot_mensaje: task.prog_mensaje,
            hnot_tipo_mensaje: task.prog_tipo_mensaje,
            hnot_destinatarios: JSON.stringify(recipientList),
            hnot_destinatarios_conteo: filteredUsers.length,
            hnot_exitosas: successCount,
            hnot_fallidas: failCount,
            hnot_fecha_envio: ahoraUTC
          });
          console.log(`✅ [CRON NOTIFICACIONES] Historial de ejecución guardado para tarea ${task.prog_id}.`);
        } catch (dbError) {
          console.error('❌ Error al guardar historial en CRON:', dbError);
        }

        // Actualizar estado final del agendamiento
        await notificacionesProgramadasModels.update(
          { 
            prog_estado: task.prog_es_recurrente ? 'PENDIENTE' : 'ENVIADO', 
            prog_ultima_ejecucion: ahoraUTC 
          },
          { where: { prog_id: task.prog_id } }
        );

      } catch (taskError) {
        console.error(`❌ Error ejecutando tarea programada ${task.prog_id}:`, taskError);
        await notificacionesProgramadasModels.update(
          { prog_estado: 'PENDIENTE' },
          { where: { prog_id: task.prog_id } }
        );
      }
    }
  } catch (err) {
    console.error('❌ Error en cron runner de notificaciones programadas:', err);
  }
};

const startScheduledNotifications = () => {
  cron.schedule('*/30 * * * *', verificarNotificacionesProgramadas);
};

const startMantenimientoPersonalizadoCron = () => {
  // Ejecutar todos los domingos a las 01:00 AM
  cron.schedule('0 1 * * 0', async () => {
    console.log('🔄 [CRON MANTENIMIENTO PERSONALIZADO] Ejecutando programador automático...');
    await programarMantenimientosSemanalesSura();
  });
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
  verificarPrestamosVencidos,
  startScheduledNotifications,
  verificarNotificacionesProgramadas,
  startMantenimientoPersonalizadoCron
};