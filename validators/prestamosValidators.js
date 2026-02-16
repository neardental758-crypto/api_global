const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreatePrestamos = [
    // check("pre_id").exists().notEmpty(),	
    check("pre_hora_server").exists().notEmpty(),
    check("pre_usuario").exists().notEmpty(),	
    check("pre_bicicleta").exists().notEmpty(),	
    check("pre_retiro_estacion").exists().notEmpty(),	
    check("pre_retiro_bicicletero").exists().notEmpty(),	
    check("pre_retiro_fecha").exists().notEmpty(),	
    check("pre_retiro_hora").exists().notEmpty(),	
    check("pre_devolucion_estacion").exists().notEmpty(),
    check("pre_devolucion_bicicletero").exists().notEmpty(),	
    check("pre_devolucion_fecha").exists().notEmpty(),	
    check("pre_devolucion_hora").exists().notEmpty(),	
    check("pre_duracion").exists().notEmpty(),	
    check("pre_dispositivo").exists().notEmpty(),
    check("pre_estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetPrestamos = [
    check("pre_id", "El ID del préstamo es necesario").exists().notEmpty().isNumeric(),
    (req, res, next) => {
        // Permitir que el pre_id venga en los params
        if (req.params.pre_id) {
            req.pre_id = req.params.pre_id;
        }
        return validateResults(req, res, next);
    }
];

const validatorUpdatePrestamos = [
    check("pre_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
]

const validatorGetUsuario = [
    check("pre_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorOrganizationId = [
    check("organizationId").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];
const validatorStationId = [
    check("stationId").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorFinalizeLoan = [
    check("pre_id")
        .exists()
        .notEmpty()
        .isInt(),
    check("userId")
        .optional()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorFinalizeLoan4g = [
    check("pre_id")
        .exists()
        .notEmpty()
        .isInt(),
    check("userId")
        .optional()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreatePrestamos, validatorGetPrestamos, validatorUpdatePrestamos, validatorGetUsuario, validatorOrganizationId, validatorStationId, validatorFinalizeLoan, validatorFinalizeLoan4g};