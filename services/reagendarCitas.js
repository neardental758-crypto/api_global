const { practicaActivaModels, agendamientoOperarioModels } = require('../models');
const { generarCuposParaAgendamiento } = require('./practicaGenerator');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

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
    const citasReagendadas = await practicaActivaModels.findAll({
      where: {
        practica_estado: 'ACTIVA',
        reagendada: true,
        agendamiento_id: null
      },
    });

    for (const cita of citasReagendadas) {
      const nuevaFechaCita = moment(cita.practica_fecha).add(7, 'days');
      
      const citaData = cita.toJSON();
      
      const nuevaPractica = {
        ...citaData,
        _id: uuidv4(),
        practica_fecha: nuevaFechaCita.format('YYYY-MM-DD HH:mm:ss'),
        reagendada: true,
      };

      delete nuevaPractica.id;
      
      await practicaActivaModels.create(nuevaPractica);
    }

  } catch (error) {
    console.error('❌ Error al reagendar las citas:', error.message);
  }
}

module.exports = { reagendarCitas };