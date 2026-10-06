const { practicaActivaModels, agendamientoOperarioModels } = require('../models');
const { generarCuposParaAgendamiento } = require('./practicaGenerator');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

async function reagendarCitas() {
  try {
    // 1. Proyectar cupos para todos los agendamientos de mantenimiento activos
    const agendamientosActivos = await agendamientoOperarioModels.findAll({
      where: {
        activo: true,
        crear_cupos_practica: true
      }
    });

    for (const ag of agendamientosActivos) {
      if (ag.hora_inicio && ag.hora_fin) {
        await generarCuposParaAgendamiento(ag.toJSON(), 4);
      }
    }

    // 2. Reagendado semanal de citas independientes
    // Solo tomar citas vencidas en los últimos 7 días (estrictamente en el pasado, no futuras)
    const hace7Dias = moment().subtract(7, 'days').format('YYYY-MM-DD 00:00:00');
    const hoy = moment().format('YYYY-MM-DD 00:00:00');

    const citasReagendadas = await practicaActivaModels.findAll({
      where: {
        practica_estado: 'ACTIVA',
        reagendada: true,
        agendamiento_id: null,
        practica_fecha: {
          [Op.gte]: hace7Dias,
          [Op.lt]: hoy
        }
      },
    });

    for (const cita of citasReagendadas) {
      const nuevaFechaCita = moment(cita.practica_fecha).add(7, 'days');
      const nuevaFechaStr = nuevaFechaCita.format('YYYY-MM-DD HH:mm:ss');

      const nuevaFechaISO = nuevaFechaCita.toISOString();
      const nuevaFechaUtc = nuevaFechaCita.utc().format('YYYY-MM-DDTHH:mm:ss.000Z');

      // Verificar que no exista ya un turno en esa estación y fecha antes de crear
      const yaExiste = await practicaActivaModels.findOne({
        where: {
          practica_estacion: cita.practica_estacion,
          practica_fecha: {
            [Op.in]: [nuevaFechaStr, nuevaFechaISO, nuevaFechaUtc]
          },
          practica_estado: { [Op.ne]: 'CANCELADA' }
        }
      });

      if (!yaExiste) {
        const citaData = cita.toJSON();
        const nuevaPractica = {
          ...citaData,
          _id: uuidv4(),
          practica_fecha: nuevaFechaStr,
          reagendada: true,
        };

        delete nuevaPractica.id;
        await practicaActivaModels.create(nuevaPractica);
      }

      // Desactivar reagendado en la cita original para evitar duplicaciones
      await cita.update({ reagendada: false });
    }

  } catch (error) {
    console.error('❌ Error al reagendar las citas:', error.message);
  }
}

module.exports = { reagendarCitas };