// middlewares/checkAchievementById.js
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const { 
  logrosModels, 
  progresoLogrosModels, 
  usuarioModels, 
  empresaLogroModels 
} = require("../models");

/**
 * Middleware para verificar y actualizar progreso de logros
 * @param {number|string} idLogro - ID del logro a verificar
 * @param {string} userField - Campo donde viene el ID del usuario (default: "usuario_id")
 */
function checkAchievementById(idLogro, userField = "usuario_id") {
  return async function (req, res, next) {
    try {
      // Obtener usuario desde token o body
      const usuarioId = req.user?.usu_documento || req.body[userField];

      if (!usuarioId) {
        //console.warn("⚠️ No se encontró usuario para verificar logro");
        return next();
      }

      // 1. Buscar usuario y obtener empresa
      const usuario = await usuarioModels.findOne({
        where: { usu_documento: usuarioId },
        attributes: ["usu_documento", "usu_empresa"],
      });

      if (!usuario) {
        //console.warn(`⚠️ Usuario ${usuarioId} no encontrado`);
        return next();
      }

      const empresaId = usuario.usu_empresa;

      // 2. Buscar configuración del logro para esta empresa
      const empresaLogro = await empresaLogroModels.findOne({
        where: { 
          idLogro: String(idLogro), // 🔧 Convertir a string por si acaso
          idEmpresa: empresaId,
          estado: "ACTIVO", // ✅ Filtrar desde la query
        },
      });

      if (!empresaLogro) {
        //console.log(`ℹ️ Logro ${idLogro} no configurado o inactivo para empresa ${empresaId}`);
        return next();
      }

      // 3. Validar fechas de vigencia
      const ahora = new Date();
      const fechaInicio = empresaLogro.fecha_inicio ? new Date(empresaLogro.fecha_inicio) : null;
      const fechaFin = empresaLogro.fecha_fin ? new Date(empresaLogro.fecha_fin) : null;

      if (fechaInicio && ahora < fechaInicio) {
        //console.log(`⏰ Logro ${idLogro} aún no ha iniciado (inicia: ${fechaInicio})`);
        return next();
      }

      if (fechaFin && ahora > fechaFin) {
        //console.log(`⏰ Logro ${idLogro} ya expiró (finalizó: ${fechaFin})`);
        return next();
      }

      // 4. Validar valores numéricos
      const incremento = Number(empresaLogro.valor) || 1;
      const meta = Number(empresaLogro.meta) || 1;

      if (incremento <= 0 || meta <= 0) {
        //console.error(`❌ Valores inválidos para logro ${idLogro}: valor=${empresaLogro.valor}, meta=${empresaLogro.meta}`);
        return next();
      }

      // 5. Buscar o crear progreso (con lock para evitar race conditions)
      const [progreso, created] = await progresoLogrosModels.findOrCreate({
        where: { 
          usuario_id: usuarioId, 
          logro_id: String(idLogro) 
        },
        defaults: {
          id: uuidv4(),
          usuario_id: usuarioId,
          logro_id: String(idLogro),
          progreso: 0,
          estado: "INCOMPLETO",
          ultima_actualizacion: new Date(),
        },
        lock: true, // 🔒 Evita race conditions
      });

      // 6. Actualizar progreso de forma atómica
      const nuevoProgreso = progreso.progreso + incremento;
      const estadoFinal = nuevoProgreso >= meta ? "COMPLETADO" : "INCOMPLETO";
      const yaCompletado = progreso.estado === "COMPLETADO";

      // No incrementar si ya estaba completado (opcional, depende de lógica de negocio)
      if (yaCompletado) {
        //console.log(`✓ Logro ${idLogro} ya completado por usuario ${usuarioId}`);
        return next();
      }

      await progreso.update({
        progreso: Math.min(nuevoProgreso, meta), // 🔧 No exceder la meta
        estado: estadoFinal,
        ultima_actualizacion: new Date(),
      });

      // 7. Log detallado
      /*if (created) {
        console.log(`🎉 Nuevo progreso creado:`);
      } else {
        console.log(`✅ Progreso actualizado:`);
      }
      
      console.log(`   Usuario: ${usuarioId}`);
      console.log(`   Empresa: ${empresaId}`);
      console.log(`   Logro: ${idLogro}`);
      console.log(`   Progreso: ${Math.min(nuevoProgreso, meta)}/${meta} (${estadoFinal})`);
      console.log(`   Incremento: +${incremento}`); */

      // 8. Opcional: agregar info al request para uso posterior
      req.achievementUpdate = {
        logroId: idLogro,
        progreso: Math.min(nuevoProgreso, meta),
        meta,
        estado: estadoFinal,
        completado: estadoFinal === "COMPLETADO",
        recienCompletado: estadoFinal === "COMPLETADO" && !created && progreso.estado !== "COMPLETADO",
      };

      next();
    } catch (err) {
      console.error("❌ Error en checkAchievementById:", err);
      // No lanzar error para no bloquear la operación principal
      next();
    }
  };
}

module.exports = checkAchievementById;