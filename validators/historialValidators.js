const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("his_id").exists().notEmpty(),
    check("his_usuario").exists().notEmpty(),
    check("his_estacion").exists().notEmpty(),
    check("his_bicicletero").exists().notEmpty(),
    check("his_bicicleta").exists().notEmpty(),
    check("his_fecha").exists().notEmpty(),
    check("his_clave_old").exists().notEmpty(),
    check("his_clave_new").exists().notEmpty(),
    check("his_estado").exists().notEmpty(),	
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGet = [
    check("pre_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdate = [
    check("his_id").exists().notEmpty(),
    check("his_estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
]

const validatorGetLastTen = [
    check("his_bicicleta").exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreate, validatorGet, validatorUpdate, validatorGetLastTen };