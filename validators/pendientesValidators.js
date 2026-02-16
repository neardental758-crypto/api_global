const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorCreatePendiente = [
    check("bicicleta_id")
        .exists()
        .notEmpty()
        .isInt(),
    check("componente_id")
        .exists()
        .notEmpty()
        .isInt(),
    check("estado_requerido")
        .exists()
        .notEmpty()
        .isIn(['cambio', 'ajuste', 'arreglo', 'revisión']),
    check("prioridad")
        .optional()
        .isIn(['baja', 'media', 'alta', 'urgente']),
    check("operario_id")
        .exists()
        .notEmpty()
        .isString(),
    check("mantenimiento_id")
        .optional()
        .isInt(),
    check("comentario")
        .optional()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorGetPendiente = [
    check("id")
        .exists()
        .notEmpty()
        .isInt(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorPatchPendiente = [
    check("id")
        .exists()
        .notEmpty()
        .isInt(),
    check("estado_requerido")
        .optional()
        .isIn(['cambio', 'ajuste', 'arreglo', 'revisión']),
    check("prioridad")
        .optional()
        .isIn(['baja', 'media', 'alta', 'urgente']),
    check("estado")
        .optional()
        .isIn(['pendiente', 'programado', 'en_proceso', 'completado', 'cancelado']),
    check("fecha_programada")
        .optional()
        .isISO8601(),
    check("comentario")
        .optional()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorCompletarPendiente = [
    check("id")
        .exists()
        .notEmpty()
        .isInt(),
    check("comentario")
        .optional()
        .isString(),
    check("accion_realizada")
        .exists()
        .notEmpty()
        .isIn(['diagnóstico', 'reparación', 'reemplazo', 'ajuste', 'ninguna']),
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

const validatorGetPorOperario = [
    check("operario_id")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = {
    validatorCreatePendiente,
    validatorGetPendiente,
    validatorPatchPendiente,
    validatorCompletarPendiente,
    validatorGetPorBicicleta,
    validatorGetPorEstacion,
    validatorGetPorEmpresa,
    validatorGetPorOperario
};