const { practicaActivaModels } = require('../models');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

async function reagendarCitas() {
  try {
    const citasReagendadas = await practicaActivaModels.findAll({
      where: {
        practica_estado: 'ACTIVA',
        reagendada: true,
      },
    });

    for (const cita of citasReagendadas) {
      const nuevaFechaCita = moment(cita.practica_fecha).add(7, 'days');
      
      // Obtén el objeto limpio
      const citaData = cita.toJSON();
      
      // Crea el objeto nuevo sin campos problemáticos
      const nuevaPractica = {
        ...citaData,
        _id: uuidv4(),
        // Convierte la fecha a formato MySQL 'YYYY-MM-DD HH:mm:ss'
        practica_fecha: nuevaFechaCita.format('YYYY-MM-DD HH:mm:ss'),
        reagendada: true,
      };

      // Elimina el ID original si existe
      delete nuevaPractica.id;
      
      await practicaActivaModels.create(nuevaPractica);
    }

  } catch (error) {
    console.error('❌ Error al reagendar las citas:', error.message);
    // NO relanzar el error para evitar que el CRON se detenga
  }
}

module.exports = { reagendarCitas };