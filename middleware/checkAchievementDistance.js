// middlewares/checkAchievementDistance.js
const { v4: uuidv4 } = require("uuid");
const { progresoLogrosModels, usuarioModels, empresaLogroModels } = require("../models");

function checkAchievementDistance(idLogro, userField = "ind_usuario", distanceField = "ind_distancia") {
  return async function (req, res, next) {
    try {
      const usuarioId = req.user?.usu_documento || req.body[userField];
      const distancia = req.body[distanceField];

      if (!usuarioId || !distancia) {
        return next();
      }

      // 1. Buscar usuario en bc_usuarios
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
        return next();
      }

      // 🚨 Validar estado
      if (empresaLogro.estado !== "ACTIVO") {
        console.log(`⚠ Logro ${idLogro} en empresa ${empresaId} está en estado ${empresaLogro.estado}`);
        return next();
      }

      const fechaInicio = new Date(empresaLogro.inicio);
      const fechaFin = new Date(empresaLogro.fin);
      const hoy = new Date();

      // 3. Validar rango de fechas
      if (hoy < fechaInicio || hoy > fechaFin) {
        console.log(`⚠ Usuario ${usuarioId} reportó distancia fuera del rango del logro ${idLogro}`);
        return next();
      }

      // 4. Validar distancia vs meta
      if (distancia >= empresaLogro.meta) {
        let progreso = await progresoLogrosModels.findOne({
          where: { usuario_id: usuarioId, logro_id: idLogro },
        });

        if (progreso) {
          if (progreso.estado !== "COMPLETADO") {
            await progreso.update({
              progreso: empresaLogro.meta,
              estado: "COMPLETADO",
              ultima_actualizacion: new Date(),
            });
            console.log(`🏁 Logro de distancia ${idLogro} completado para usuario ${usuarioId}`);
          } else {
            console.log(`✔ Usuario ${usuarioId} ya completó el logro de distancia ${idLogro}`);
          }
        } else {
          await progresoLogrosModels.create({
            id: uuidv4(),
            usuario_id: usuarioId,
            logro_id: idLogro,
            progreso: empresaLogro.meta,
            estado: "COMPLETADO",
            ultima_actualizacion: new Date(),
          });
          console.log(`🎉 Nuevo logro de distancia completado (${empresaLogro.meta} m) para usuario ${usuarioId}`);
        }
      } else {
        console.log(`ℹ Distancia (${distancia}) insuficiente para el logro (${empresaLogro.meta})`);
      }

      next();
    } catch (err) {
      console.error("❌ Error en checkAchievementDistance:", err);
      next();
    }
  };
}

module.exports = checkAchievementDistance;
