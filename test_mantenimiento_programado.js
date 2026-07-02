require("dotenv").config();
const { 
  prestamosModels, 
  mantenimientoModels, 
  usuarioModels, 
  estacionModels, 
  empresaModels 
} = require('./models');
const { Op } = require('sequelize');
const { dbConnectMysql } = require('./config/mysql');

async function testSimulacionMantenimiento() {
  console.log('🧪 [TEST SIMULACION] Iniciando conexión a DB...');
  await dbConnectMysql();
  
  try {
    console.log('🔄 [TEST SIMULACION] Buscando estación Davivienda Torre Sura...');
    const estacion = await estacionModels.findOne({
      where: {
        est_estacion: { [Op.like]: '%Davivienda Torre Sura%' }
      }
    });
    
    if (!estacion) {
      console.error('❌ Estación no encontrada.');
      process.exit(1);
    }
    console.log(`✅ Estación encontrada: ID=${estacion.est_id}, Nombre="${estacion.est_estacion}"`);

    // Buscar empresa
    let empresaId = '1';
    if (estacion.est_empresa) {
      const empresa = await empresaModels.findOne({
        where: { emp_nombre: estacion.est_empresa }
      });
      if (empresa) {
        empresaId = empresa.emp_id;
      }
    }
    console.log(`✅ Empresa ID resuelta: ${empresaId}`);

    console.log('🔄 [TEST SIMULACION] Consultando préstamos personalizados en Davivienda Torre Sura...');
    const prestamos = await prestamosModels.findAll({
      where: {
        pre_devolucion_estacion: { [Op.like]: '%Davivienda Torre Sura%' },
        pre_estado: { [Op.like]: '%PRESTAMO PERSONALIZADO%' }
      }
    });

    console.log(`📊 Préstamos personalizados encontrados: ${prestamos.length}`);
    if (prestamos.length === 0) {
      console.log('ℹ️ No hay datos para procesar.');
      process.exit(0);
    }

    const bicisAsignadas = prestamos.map(p => ({
      bicicleta_id: p.pre_bicicleta,
      usuario_documento: p.pre_usuario,
      prestamo_id: p.pre_id
    })).filter(item => item.bicicleta_id && item.usuario_documento);

    const bicisIds = bicisAsignadas.map(b => b.bicicleta_id);
    console.log(`🚲 Bicicletas únicas asignadas: ${[...new Set(bicisIds)].length}`);

    // Excluir mantenimientos preventivos activos
    const mantenimientosActivos = await mantenimientoModels.findAll({
      where: {
        bicicleta_id: { [Op.in]: bicisIds },
        tipo_mantenimiento: 'preventivo',
        estado: { [Op.in]: ['pendiente', 'en_proceso'] }
      }
    });

    const bicisIdsExcluir = new Set(mantenimientosActivos.map(m => m.bicicleta_id));
    console.log(`🚫 Bicicletas excluidas (con mantenimientos activos pendientes/en proceso): ${bicisIdsExcluir.size}`);
    
    const bicisCandidatas = bicisAsignadas.filter(b => !bicisIdsExcluir.has(b.bicicleta_id));
    console.log(`🔍 Bicicletas candidatas finales para agendar: ${bicisCandidatas.length}`);

    if (bicisCandidatas.length === 0) {
      console.log('ℹ️ No hay bicicletas candidatas para mantenimiento esta semana.');
      process.exit(0);
    }

    // Buscar último mantenimiento preventivo finalizado
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

      // Obtener nombre del usuario para el reporte
      const usuario = await usuarioModels.findOne({
        where: { usu_documento: cand.usuario_documento }
      });

      candidatasConFecha.push({
        ...cand,
        usuario_nombre: usuario ? usuario.usu_nombre : 'Desconocido',
        fecha_ultimo_mantenimiento: ultimoMant ? new Date(ultimoMant.fecha_finalizacion) : new Date(0)
      });
    }

    // Ordenar de menor a mayor
    candidatasConFecha.sort((a, b) => a.fecha_ultimo_mantenimiento - b.fecha_ultimo_mantenimiento);

    console.log('\n📋 --- REPORTE DE ORDEN DE PRIORIDAD DE MANTENIMIENTO ---');
    candidatasConFecha.forEach((b, idx) => {
      const fechaStr = b.fecha_ultimo_mantenimiento.getTime() === 0 
        ? 'NUNCA' 
        : b.fecha_ultimo_mantenimiento.toISOString().slice(0, 10);
      console.log(`${idx + 1}. Bici ID: ${b.bicicleta_id} | Usuario: ${b.usuario_nombre} (${b.usuario_documento}) | Último Mantenimiento: ${fechaStr}`);
    });

    const elegidas = candidatasConFecha.slice(0, 10);
    console.log('\n🌟 --- 10 VEHÍCULOS QUE SE SELECCIONARÍAN PARA ESTA SEMANA ---');
    elegidas.forEach((b, idx) => {
      console.log(`[ELEGIDA ${idx + 1}] Bici ID: ${b.bicicleta_id} | Usuario: ${b.usuario_nombre} (${b.usuario_documento})`);
    });

    console.log('\n🏁 Simulación completada correctamente.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la simulación:', err);
    process.exit(1);
  }
}

testSimulacionMantenimiento();
