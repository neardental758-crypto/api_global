const { check, param } = require('express-validator');

const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("vus_id").exists().notEmpty(),
    check("vus_usuario").exists().notEmpty(),
    check("vus_tipo").exists().notEmpty(),
    check("vus_marca").exists().notEmpty(),
    check("vus_modelo").exists().notEmpty(),
    check("vus_cilindraje").exists().notEmpty(),
    check("vus_color").exists().notEmpty(),
    check("vus_serial").exists().notEmpty(),
    check("vus_fecha_registro").exists().notEmpty(),
    check("vus_estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGet = [
    check("vus_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdate = [
    check("vus_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
]

const validatorVehiculo = [
    check("vus_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetUsuario = [
    check("vus_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetVehiculoUsuario = [
    check("vus_id").exists().notEmpty(),
    check("vus_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];


const validatorEmpresa = [
    param("empresaId")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreate, validatorGet, validatorUpdate, validatorGetUsuario, validatorVehiculo, validatorGetVehiculoUsuario, validatorEmpresa };