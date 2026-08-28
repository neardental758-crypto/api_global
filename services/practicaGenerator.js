const { practicaActivaModels } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

const DIAS_MAP = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  sábado: 6
};

/**
 * Normaliza nombre de día sin tildes
 */
function normalizarDia(dia) {
  if (!dia) return '';
  return dia.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Genera cupos para las próximas N semanas a partir de un agendamiento de mantenimiento
 * @param {Object} agendamiento
 * @param {number} semanasAdelante
 */
async function generarCuposParaAgendamiento(agendamiento, semanasAdelante = 4) {
  try {
    if (!agendamiento) return { success: false, message: 'Agendamiento no provisto' };

    const {
      id,
      operario_id,
      estacion_id,
      dias_semana,
      hora_inicio,
      hora_fin,
      cupos_por_turno = 1,
      crear_cupos_practica = true,
      activo = true
    } = agendamiento;

    if (!activo || crear_cupos_practica === false || crear_cupos_practica === 0) {
      return { success: true, count: 0, message: 'Agendamiento inactivo o no configurado para generar cupos' };
    }

    if (!hora_inicio || !hora_fin || !dias_semana) {
      return { success: false, message: 'Faltan campos de horario o días' };
    }

    // Normalizar días de semana
    const diasArray = (Array.isArray(dias_semana) ? dias_semana : dias_semana.split(','))
      .map(d => normalizarDia(d))
      .filter(d => DIAS_MAP[d] !== undefined);

    if (diasArray.length === 0) {
      return { success: false, message: 'No hay días válidos especificados' };
    }

    const [startH, startM] = hora_inicio.split(':').map(Number);
    const [endH, endM] = hora_fin.split(':').map(Number);

    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
      return { success: false, message: 'Formato de hora inválido' };
    }

    const startTotalMin = startH * 60 + startM;
    const endTotalMin = endH * 60 + endM;

    if (startTotalMin >= endTotalMin) {
      return { success: false, message: 'La hora de inicio debe ser anterior a la hora de fin' };
    }

    // Fecha actual en hora local Colombia (UTC-5)
    const ahoraUTC = new Date();
    const ahoraColombia = new Date(ahoraUTC.getTime() - (5 * 60 * 60 * 1000));
    
    // Proyectamos hasta N semanas (ej. 28 días)
    const totalDiasProyeccion = semanasAdelante * 7;
    const itemsACrear = [];

    for (let i = 0; i < totalDiasProyeccion; i++) {
      const fechaIteracion = new Date(ahoraColombia.getFullYear(), ahoraColombia.getMonth(), ahoraColombia.getDate() + i);
      const diaSemanaIndex = fechaIteracion.getDay();

      const diaNombre = Object.keys(DIAS_MAP).find(k => DIAS_MAP[k] === diaSemanaIndex && diasArray.includes(normalizarDia(k)));

      if (diaNombre) {
        // Generar intervalos de 30 minutos
        let currentSlotMin = startTotalMin;

        while (currentSlotMin + 30 <= endTotalMin) {
          const slotStartH = Math.floor(currentSlotMin / 60);
          const slotStartM = currentSlotMin % 60;

          const slotEndMin = currentSlotMin + 30;
          const slotEndH = Math.floor(slotEndMin / 60);
          const slotEndM = slotEndMin % 60;

          const horaFinalFormatted = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`;
          
          // Crear fecha de inicio en formato Date UTC correspondiente a la hora local
          const year = fechaIteracion.getFullYear();
          const month = fechaIteracion.getMonth();
          const day = fechaIteracion.getDate();

          // La fecha se almacena en UTC o ISO string
          const slotStartDate = new Date(Date.UTC(year, month, day, slotStartH + 5, slotStartM, 0, 0));
          const fechaISO = slotStartDate.toISOString();

          // Verificar si ya existe un slot idéntico
          const existe = await practicaActivaModels.findOne({
            where: {
              practica_funcionario: operario_id,
              practica_estacion: estacion_id,
              practica_fecha: fechaISO,
              practica_estado: { [Op.ne]: 'CANCELADA' }
            }
          });

          if (!existe) {
            itemsACrear.push({
              _id: uuidv4(),
              practica_funcionario: operario_id,
              practica_cupos: cupos_por_turno || 1,
              practica_estacion: estacion_id,
              practica_fecha: fechaISO,
              practica_hora_finalizar: horaFinalFormatted,
              practica_estado: 'ACTIVA',
              reagendada: true,
              agendamiento_id: id || null
            });
          }

          currentSlotMin += 30;
        }
      }
    }

    if (itemsACrear.length > 0) {
      await practicaActivaModels.bulkCreate(itemsACrear);
    }

    return { success: true, count: itemsACrear.length };
  } catch (error) {
    console.error('Error generando cupos para agendamiento:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina o resincroniza los cupos futuros asociados a un agendamiento
 * @param {number} agendamientoId
 * @param {Object|null} nuevosDatos
 */
async function eliminarOSincronizarCupos(agendamientoId, nuevosDatos = null) {
  try {
    if (!agendamientoId) return { success: false, message: 'ID de agendamiento requerido' };

    const ahoraUTC = new Date();
    const fechaActualISO = ahoraUTC.toISOString();

    // Eliminar slots futuros que pertenezcan a este agendamiento_id
    await practicaActivaModels.destroy({
      where: {
        agendamiento_id: agendamientoId,
        practica_fecha: { [Op.gte]: fechaActualISO },
        practica_estado: 'ACTIVA'
      }
    });

    // Si se enviaron nuevos datos y está activo, regenerar
    if (nuevosDatos && nuevosDatos.activo && nuevosDatos.crear_cupos_practica !== false) {
      const agendamientoData = {
        id: agendamientoId,
        ...nuevosDatos
      };
      return await generarCuposParaAgendamiento(agendamientoData);
    }

    return { success: true, message: 'Cupos eliminados/sincronizados correctamente' };
  } catch (error) {
    console.error('Error eliminando/sincronizando cupos:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generarCuposParaAgendamiento,
  eliminarOSincronizarCupos,
  normalizarDia
};
