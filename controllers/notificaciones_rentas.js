const { Op } = require('sequelize');
const { 
  prestamosModels, 
  usuarioModels, 
  estacionModels,
  empresaModels,
  notificacionesRentasModels 
} = require('../models');

const Estacion = require('../models/mysql/estacion');

let isCheckingRentas = false;
let checkInterval = null;

const httpError = (res, message, code = 403) => {
  res.status(code).send({ error: message });
};

const getNotificaciones = async (req, res) => {
  try {
    const data = await notificacionesRentasModels.findAll({
      include: [
        {
          model: prestamosModels,
          as: 'renta',
          required: false,
          include: [
            {
              model: usuarioModels,
              required: false
            },
            {
              model: estacionModels,
              required: false,
              include: [
                {
                  model: empresaModels,
                  required: false
                }
              ]
            }
          ]
        }
      ],
      order: [['not_fecha_creacion', 'DESC']]
    });

    const dataWithInfo = data.map(notificacion => {
      const renta = notificacion.renta;
      const usuario = renta?.bc_usuario;
      const estacion = renta?.bc_estacione;
      const empresa = estacion?.bc_empresa;

      return {
        ...notificacion.dataValues,
        usuario_nombre: usuario?.usu_nombre || notificacion.not_usuario,
        estacion_nombre: estacion?.est_estacion || 'N/A',
        empresa_nombre: empresa?.emp_nombre || 'N/A',
        horas_permitidas: estacion?.est_last_conect || 'N/A'
      };
    });

    res.send(dataWithInfo);
  } catch (error) {
    console.error(error);
    httpError(res, "ERROR_GET_NOTIFICACIONES");
  }
};

const checkRentasVencidas = async () => {
  if (isCheckingRentas) {
    return;
  }

  isCheckingRentas = true;
  const timeoutId = setTimeout(() => {
    isCheckingRentas = false;
  }, 50000);

  try {
    const ahora = new Date();
    
    const rentasActivasConEstacion = await Promise.race([
      prestamosModels.findAll({
        where: { pre_estado: 'ACTIVA' },
        attributes: ['pre_id', 'pre_retiro_fecha', 'pre_retiro_hora', 'pre_usuario', 'pre_estacion_id'],
        include: [{
          model: Estacion,
          attributes: ['est_last_conect'],
          required: true
        }],
        raw: true,
        nest: true
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout query rentas activas')), 25000)
      )
    ]);

    if (!rentasActivasConEstacion || rentasActivasConEstacion.length === 0) {
      return;
    }

    const notificacionesExistentesMap = await Promise.race([
      notificacionesRentasModels.findAll({
        where: {
          not_renta_id: rentasActivasConEstacion.map(r => r.pre_id)
        },
        attributes: ['not_id', 'not_renta_id', 'not_estado'],
        raw: true
      }).then(notifs => {
        const map = {};
        notifs.forEach(n => { map[n.not_renta_id] = n; });
        return map;
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout query notificaciones')), 20000)
      )
    ]);

    const notificacionesACrear = [];
    const notificacionesAActualizar = [];

    for (const renta of rentasActivasConEstacion) {
      try {
        const horasPermitidas = parseInt(renta.bc_estacione?.est_last_conect);
        if (!horasPermitidas || !renta.pre_retiro_fecha) continue;

        let fechaRetiro = new Date(renta.pre_retiro_fecha);
        if (isNaN(fechaRetiro.getTime())) continue;

        if (renta.pre_retiro_hora) {
          const [horas, minutos, segundos] = renta.pre_retiro_hora.toString().split(':').map(v => parseInt(v) || 0);
          fechaRetiro.setHours(horas, minutos, segundos, 0);
        }

        const fechaVencimiento = new Date(fechaRetiro);
        fechaVencimiento.setHours(fechaVencimiento.getHours() + horasPermitidas);

        if (isNaN(fechaVencimiento.getTime()) || ahora <= fechaVencimiento) continue;

        const notifExistente = notificacionesExistentesMap[renta.pre_id];

        if (!notifExistente) {
          notificacionesACrear.push({
            not_renta_id: renta.pre_id,
            not_usuario: renta.pre_usuario,
            not_fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
            not_hora_vencimiento: fechaVencimiento.toTimeString().substring(0, 8),
            not_estado: 'PENDIENTE'
          });
        } else if (notifExistente.not_estado === 'EXTENDIDO') {
          notificacionesAActualizar.push({
            not_id: notifExistente.not_id,
            not_fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
            not_hora_vencimiento: fechaVencimiento.toTimeString().substring(0, 8)
          });
        }
      } catch (error) {
        continue;
      }
    }

    if (notificacionesACrear.length > 0) {
      await notificacionesRentasModels.bulkCreate(notificacionesACrear, {
        ignoreDuplicates: true
      });
    }

    if (notificacionesAActualizar.length > 0) {
      for (let i = 0; i < notificacionesAActualizar.length; i += 50) {
        const lote = notificacionesAActualizar.slice(i, i + 50);
        const ids = lote.map(n => n.not_id);
        
        for (const notif of lote) {
          await notificacionesRentasModels.update({
            not_estado: 'PENDIENTE',
            not_fecha_vencimiento: notif.not_fecha_vencimiento,
            not_hora_vencimiento: notif.not_hora_vencimiento
          }, {
            where: { not_id: notif.not_id }
          });
        }
      }
    }

    const rentasNoActivas = await Promise.race([
      prestamosModels.findAll({
        where: {
          pre_estado: { [Op.ne]: 'ACTIVA' }
        },
        attributes: ['pre_id'],
        raw: true
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout rentas no activas')), 15000)
      )
    ]);

    if (rentasNoActivas.length > 0) {
      await notificacionesRentasModels.update(
        { not_estado: 'FINALIZADO' },
        { 
          where: { 
            not_renta_id: rentasNoActivas.map(r => r.pre_id),
            not_estado: { [Op.in]: ['PENDIENTE', 'EXTENDIDO'] }
          } 
        }
      );
    }

  } catch (error) {
    if (error.code === 'EAI_AGAIN' || error.code === 'ETIMEDOUT') {
      console.error('Error de conexión RDS:', error.message);
    } else if (!error.message.includes('Timeout')) {
      console.error('Error en checkRentasVencidas:', error);
    }
  } finally {
    clearTimeout(timeoutId);
    isCheckingRentas = false;
  }
};

const updateNotificacion = async (req, res) => {
  try {
    const { body } = req;
    
    if (!body.not_id) {
      return res.status(400).send({ error: "not_id es requerido" });
    }
    
    if (!body.estado) {
      return res.status(400).send({ error: "estado es requerido" });
    }

    const notificacion = await notificacionesRentasModels.findByPk(body.not_id);
    if (notificacion) {
      const renta = await prestamosModels.findOne({
        where: { pre_id: notificacion.not_renta_id }
      });

      if (renta && renta.pre_estado !== 'ACTIVA') {
        await notificacionesRentasModels.update(
          { not_estado: 'FINALIZADO' },
          { where: { not_id: body.not_id } }
        );
      } else {
        await notificacionesRentasModels.update(
          { not_estado: body.estado },
          { where: { not_id: body.not_id } }
        );
      }
    }
    
    res.send('ok');
  } catch (error) {
    console.error('Error en updateNotificacion:', error);
    httpError(res, "ERROR_UPDATE_NOTIFICACION");
  }
};

const extenderRenta = async (req, res) => {
  try {
    const { not_id, horas_extension } = req.body;
    
    if (!not_id || !horas_extension) {
      return res.status(400).send({ error: "not_id y horas_extension son requeridos" });
    }

    const notificacion = await notificacionesRentasModels.findByPk(not_id);
    if (!notificacion) {
      return res.status(404).send({ error: "Notificación no encontrada" });
    }

    const renta = await prestamosModels.findByPk(notificacion.not_renta_id);
    if (!renta) {
      return res.status(404).send({ error: "Renta no encontrada" });
    }

    const fechaOriginal = renta.pre_devolucion_fecha;
    let fechaFormateada;
    
    if (fechaOriginal.includes('T')) {
      const fecha = new Date(fechaOriginal);
      fecha.setUTCDate(fecha.getUTCDate() + 1);
      fechaFormateada = fecha.toISOString();
    } else {
      const [fechaParte, horaParte] = fechaOriginal.split(' ');
      const [año, mes, dia] = fechaParte.split('-');
      
      let nuevoDia = parseInt(dia) + 1;
      let nuevoMes = parseInt(mes);
      let nuevoAño = parseInt(año);
      
      const diasEnMes = new Date(nuevoAño, nuevoMes, 0).getDate();
      if (nuevoDia > diasEnMes) {
        nuevoDia = 1;
        nuevoMes++;
        if (nuevoMes > 12) {
          nuevoMes = 1;
          nuevoAño++;
        }
      }
      
      fechaFormateada = nuevoAño + '-' + 
                       String(nuevoMes).padStart(2, '0') + '-' + 
                       String(nuevoDia).padStart(2, '0') + ' ' + 
                       horaParte;
    }

    const sequelize = prestamosModels.sequelize;
    await sequelize.query(
      'UPDATE bc_prestamos SET pre_devolucion_fecha = ?, pre_devolucion_hora = ? WHERE pre_id = ?',
      {
        replacements: [fechaFormateada, renta.pre_devolucion_hora, renta.pre_id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    const fechaNotificacion = fechaFormateada.includes('T') ? 
                              fechaFormateada.split('T')[0] : 
                              fechaFormateada.split(' ')[0];

    await notificacionesRentasModels.update({
      not_estado: 'EXTENDIDO',
      not_fecha_vencimiento: fechaNotificacion,
      not_hora_vencimiento: renta.pre_devolucion_hora
    }, {
      where: { not_id: not_id }
    });

    res.send('ok');
  } catch (error) {
    console.error('Error en extenderRenta:', error);
    httpError(res, "ERROR_EXTENDER_RENTA");
  }
};

const startCheckInterval = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  checkInterval = setInterval(checkRentasVencidas, 2 * 60 * 60 * 1000);
  checkRentasVencidas();
};

const stopCheckInterval = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
};

process.on('SIGTERM', stopCheckInterval);
process.on('SIGINT', stopCheckInterval);

if (require.main === module || process.env.START_CRON === 'true') {
  startCheckInterval();
}

module.exports = { 
  getNotificaciones, 
  updateNotificacion, 
  checkRentasVencidas, 
  extenderRenta,
  startCheckInterval,
  stopCheckInterval
};