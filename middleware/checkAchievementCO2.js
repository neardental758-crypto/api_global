// middlewares/checkAchievementCO2.js
const { v4: uuidv4 } = require("uuid");
const { progresoLogrosModels, usuarioModels, empresaLogroModels } = require("../models");

function checkAchievementCO2(idLogro, userField = "ind_usuario", co2Field = "ind_co2") {
  return async function (req, res, next) {
    try {
      const usuarioId = req.user?.usu_documento || req.body[userField];
      const co2Value = req.body[co2Field];

      // Si no hay datos, continuar sin loguear (es normal en algunas rutas)
      if (!usuarioId || !co2Value) {
        return next();
      }

      // 1. Buscar usuario
      const usuario = await usuarioModels.findOne({
        where: { usu_documento: usuarioId },
      });

      if (!usuario) {
        return next();
      }

      const empresaId = usuario.usu_empresa;

      // 2. Buscar logro en empresa_logro
      const empresaLogro = await empresaLogroModels.findOne({
        where: { idLogro, idEmpresa: empresaId },
      });

      if (!empresaLogro) {
        console.log(`⚠ Logro ${idLogro} no configurado para empresa ${empresaId}`);
        return next();
      }

      // 🚨 Validar estado ACTIVO
      if (empresaLogro.estado !== "ACTIVO") {
        console.log(`⚠ Logro ${idLogro} inactivo en empresa ${empresaId}`);
        return next();
      }

      const fechaInicio = new Date(empresaLogro.inicio);
      const fechaFin = new Date(empresaLogro.fin);
      const hoy = new Date();

      // 3. Validar rango de fechas
      if (hoy < fechaInicio || hoy > fechaFin) {
        console.log(`⚠ CO₂ reportado fuera de rango para logro ${idLogro}`);
        return next();
      }

      // 4. Buscar o crear progreso
      let progreso = await progresoLogrosModels.findOne({
        where: { usuario_id: usuarioId, logro_id: idLogro },
      });

      const incremento = co2Value;
      const meta = empresaLogro.meta;

      if (progreso) {
        const nuevo_progreso = progreso.progreso + incremento;
        const estado_final = nuevo_progreso >= meta ? "COMPLETADO" : "INCOMPLETO";

        await progreso.update({
          progreso: nuevo_progreso,
          estado: estado_final,
          ultima_actualizacion: new Date(),
        });

        console.log(`✅ CO₂: ${nuevo_progreso}/${meta}g - Usuario ${usuarioId}`);
      } else {
        await progresoLogrosModels.create({
          id: uuidv4(),
          usuario_id: usuarioId,
          logro_id: idLogro,
          progreso: incremento,
          estado: incremento >= meta ? "COMPLETADO" : "INCOMPLETO",
          ultima_actualizacion: new Date(),
        });

        console.log(`🎉 Progreso CO₂ iniciado: ${incremento}g - Usuario ${usuarioId}`);
      }

      next();
    } catch (err) {
      console.error("❌ Error en checkAchievementCO2:", err.message);
      next(); // Continuar incluso si hay error
    }
  };
}

module.exports = checkAchievementCO2;