const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorCreateMantenimiento = [
    check("empresa_id")
        .exists()
        .notEmpty()
        .isString(),
    check("bicicleta_id")
        .exists()
        .notEmpty()
        .isInt(),
    check("operario_id")
        .exists()
        .notEmpty()
        .isString(),
    check("tipo_mantenimiento")
        .exists()
        .notEmpty()
        .isString(),
    check("comentarios")
        .optional()
        .isString(),
    check("bicicleta_password")
        .optional()
        .isInt(),
    check("diagnostico_componentes")
        .optional()
        .isArray(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorGetMantenimiento = [
    check("id")
        .exists()
        .notEmpty()
        .isInt(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorGetHistorial = [
    check("mantenimiento_id").exists().notEmpty().isNumeric(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorPatchMantenimiento = [
    check("id")
        .exists()
        .notEmpty()
        .isInt(),
    check("comentarios")
        .optional()
        .isString(),
    check("estado")
        .optional()
        .isIn(['pendiente', 'en_proceso', 'finalizado', 'cancelado']),
    check("operario_id")
        .optional()
        .isString(),
    check("tipo_mantenimiento")
        .optional()
        .isString(),
    check("prioridad")
        .optional()
        .isString()
        .isIn(['baja', 'media', 'alta', 'urgente']), // Opcional: validar valores específicos
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorFinalizarMantenimiento = [
    check("id")
        .exists()
        .notEmpty()
        .isInt(),
    check("comentarios")
        .optional()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorGetPorEstacion = [
    check("estacion_id")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorGetPorEmpresa = [
    check("empresa_id")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorGetPorBicicleta = [
    check("bicicleta_id")
        .exists()
        .notEmpty()
        .isInt(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorGetPorOperario = [
    check("operario_id")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorCreateMantenimientosMasivo = [
    check("mantenimientos")
      .exists()
      .withMessage("El campo mantenimientos es requerido")
      .isArray()
      .withMessage("El campo mantenimientos debe ser un array"),
    check("mantenimientos.*.empresa_id")
      .exists()
      .notEmpty()
      .withMessage("El campo empresa_id es requerido para cada mantenimiento"),
    check("mantenimientos.*.bicicleta_id")
      .exists()
      .notEmpty()
      .isInt()
      .withMessage("El campo bicicleta_id debe ser un número entero válido"),
    check("mantenimientos.*.operario_id")
      .exists()
      .notEmpty()
      .withMessage("El campo operario_id es requerido"),
    check("mantenimientos.*.estacion_id")
      .optional()
      .isInt()
      .withMessage("El campo estacion_id debe ser un número entero válido"),
    check("mantenimientos.*.tipo_mantenimiento")
      .exists()
      .notEmpty()
      .withMessage("El campo tipo_mantenimiento es requerido"),
    (req, res, next) => {
      return validateResults(req, res, next);
    }
   ];

   // En validators/mantenimiento.js
const validatorUpdateHistorial = [
    check("historial_id")
        .exists()
        .notEmpty()
        .isInt(),
    check("estado_nuevo")
        .exists()
        .notEmpty()
        .isIn(['ok', 'cambio', 'ajuste', 'arreglo', 'revisión']),
    check("accion_realizada")
        .exists()
        .notEmpty()
        .isIn(['diagnóstico', 'reparación', 'reemplazo', 'ajuste', 'ninguna']),
    check("comentario")
        .optional()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorCreateHistorial = [
    check("mantenimiento_id").exists().notEmpty().isInt(),
    check("componente_id").exists().notEmpty().isInt(),
    check("estado_anterior").exists().notEmpty(),
    check("estado_nuevo").exists().notEmpty(),
    check("accion_realizada").exists().notEmpty(),
    check("comentario").optional(),
    check("operario_id").exists().notEmpty(),
    (req, res, next) => {
      return validateResults(req, res, next);
    }
  ];


  const validatorGetEstadisticasOperario = [
    check("operario_id")
        .exists()
        .notEmpty()
        .withMessage("El ID del operario es obligatorio"),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

// Modificación del validador de fecha para aceptar query params
const validatorGetRendimientoOperarios = [
    check("fecha_inicio")
        .exists({ checkNull: true }).withMessage("La fecha de inicio es obligatoria")
        .notEmpty().withMessage("La fecha de inicio es obligatoria")
        .isDate().withMessage("Formato de fecha inválido (YYYY-MM-DD)"),
    check("fecha_fin")
        .exists({ checkNull: true }).withMessage("La fecha de fin es obligatoria")
        .notEmpty().withMessage("La fecha de fin es obligatoria")
        .isDate().withMessage("Formato de fecha inválido (YYYY-MM-DD)"),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorTrasladoMasivo = [
    check("operario_origen")
        .exists()
        .notEmpty()
        .isString(),
    check("operario_destino")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = {
    validatorCreateMantenimiento,
    validatorGetMantenimiento,
    validatorPatchMantenimiento,
    validatorFinalizarMantenimiento,
    validatorGetPorEstacion,
    validatorGetPorEmpresa,
    validatorGetPorBicicleta,
    validatorGetPorOperario,
    validatorCreateMantenimientosMasivo,
    validatorUpdateHistorial,
    validatorCreateHistorial,
    validatorGetEstadisticasOperario,
    validatorGetRendimientoOperarios,
    validatorTrasladoMasivo,
    validatorGetHistorial
};