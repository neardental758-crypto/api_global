// middlewares/checkAchievement5Viajes.js
const { v4: uuidv4 } = require("uuid");
const { progresoLogrosModels, usuarioModels, empresaLogroModels } = require("../models");

function checkAchievement5Viajes(idLogro, userField = "usuario_id") {
  return async function (req, res, next) {
    try {
      // 1️⃣ Obtener ID de usuario desde token o body
      const usuarioId = req.user?.usu_documento || req.body[userField];

      if (!usuarioId) {
        //console.log("⚠️ No se encontró usuario_id en req.user ni en body");
        return next();
      }

      // 2️⃣ Buscar usuario en bc_usuarios para obtener empresa
      const usuario = await usuarioModels.findOne({
        where: { usu_documento: usuarioId },
      });

      if (!usuario) {
        //console.log(`⚠️ Usuario ${usuarioId} no encontrado en la base de datos`);
        return next();
      }

      const empresaId = usuario.usu_empresa;

      if (!empresaId) {
        //console.log(`⚠️ Usuario ${usuarioId} no tiene empresa asignada`);
        return next();
      }

      // 3️⃣ Buscar logro en empresa_logro
      const empresaLogro = await empresaLogroModels.findOne({
        where: { 
          idLogro: idLogro.toString(), 
          idEmpresa: empresaId 
        },
      });

      if (!empresaLogro) {
        //console.log(`⚠️ Logro ${idLogro} no encontrado para empresa ${empresaId}`);
        return next();
      }

      // 4️⃣ Validar estado ACTIVO del logro
      if (empresaLogro.estado !== "ACTIVO") {
        //console.log(`⚠️ Logro ${idLogro} en empresa ${empresaId} está en estado ${empresaLogro.estado} (no ACTIVO)`);
        return next();
      }

      // 5️⃣ Validar rango de fechas del logro
      const fechaInicio = new Date(empresaLogro.inicio);
      const fechaFin = new Date(empresaLogro.fin);
      const ahora = new Date();

      if (ahora < fechaInicio) {
        //console.log(`⚠️ Logro ${idLogro} aún no ha iniciado. Inicio: ${fechaInicio.toISOString()}`);
        return next();
      }

      if (ahora > fechaFin) {
        //console.log(`⚠️ Logro ${idLogro} ya finalizó. Fin: ${fechaFin.toISOString()}`);
        return next();
      }

      // 6️⃣ Buscar progreso actual del usuario
      let progreso = await progresoLogrosModels.findOne({
        where: { 
          usuario_id: usuarioId, 
          logro_id: idLogro.toString() 
        },
      });

      // 7️⃣ Si ya existe progreso, validar si ya está completado
      if (progreso) {
        if (progreso.estado === "COMPLETADO") {
          //console.log(`✅ Usuario ${usuarioId} ya completó el logro ${idLogro}. No se actualiza.`);
          return next();
        }

        // Validar si ya alcanzó la meta (por si el estado no se actualizó correctamente)
        if (progreso.progreso >= empresaLogro.meta) {
          //console.log(`✅ Usuario ${usuarioId} ya alcanzó la meta del logro ${idLogro}. Marcando como COMPLETADO.`);
          await progreso.update({
            estado: "COMPLETADO",
            ultima_actualizacion: new Date(),
          });
          return next();
        }
      }

      // 8️⃣ Calcular nuevo progreso
      const incremento = empresaLogro.valor || 1;
      const meta = empresaLogro.meta;

      if (progreso) {
        // Actualizar progreso existente
        const nuevoProgreso = progreso.progreso + incremento;
        const estadoFinal = nuevoProgreso >= meta ? "COMPLETADO" : "INCOMPLETO";

        await progreso.update({
          progreso: nuevoProgreso,
          estado: estadoFinal,
          ultima_actualizacion: new Date(),
        });

        //console.log(`✅ Progreso actualizado - Usuario: ${usuarioId} | Logro: ${idLogro} | Empresa: ${empresaId} | Progreso: ${nuevoProgreso}/${meta} | Estado: ${estadoFinal}`);
      } else {
        // Crear nuevo progreso
        const progresoInicial = incremento;
        const estadoInicial = progresoInicial >= meta ? "COMPLETADO" : "INCOMPLETO";

        await progresoLogrosModels.create({
          id: uuidv4(),
          usuario_id: usuarioId,
          logro_id: idLogro.toString(),
          progreso: progresoInicial,
          estado: estadoInicial,
          ultima_actualizacion: new Date(),
        });

        //console.log(`🎉 Progreso creado - Usuario: ${usuarioId} | Logro: ${idLogro} | Empresa: ${empresaId} | Progreso: ${progresoInicial}/${meta} | Estado: ${estadoInicial}`);
      }

      // Continuar con el siguiente middleware o controlador
      next();
    } catch (err) {
      console.error("❌ Error en checkAchievement5Viajes:", err);
      // No detener la ejecución, continuar con el flujo normal
      next();
    }
  };
}

module.exports = checkAchievement5Viajes;