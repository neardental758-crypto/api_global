const cron = require('node-cron');
const SesionUsuario = require('../models/mysql/sesionUsuario');
const { agendamientoOperarioModels, agendamientoIncumplidoModels, estacionModels, mantenimientoModels } = require('../models');
const { Op } = require('sequelize');

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

module.exports = { startSessionCleanup, startAgendamientosCleanup, verificarIncumplimientosAgendamientos };