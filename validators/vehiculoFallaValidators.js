const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("vef_id").exists().notEmpty(),
    check("vef_usuario").exists().notEmpty(),
    check("vef_vehiculo").exists().notEmpty(),
    check("vef_fecha").exists().notEmpty(),
    check("vef_falla").exists().notEmpty(),
    check("vef_estado").exists().notEmpty(),
    
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGet = [
    check("vef_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetUsuario = [
    check("vef_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreate, validatorGet, validatorGetUsuario };