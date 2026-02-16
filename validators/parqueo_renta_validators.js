const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("id").exists().notEmpty(), 
    check("usuario").exists().notEmpty(), 
    check("parqueadero").exists().notEmpty(), 
    check("lugar_parqueo").exists().notEmpty(), 
    check("vehiculo").exists().notEmpty(), 
    check("fecha").exists().notEmpty(), 
    check("inicio").exists().notEmpty(), 
    check("fin").exists().notEmpty(), 
    check("duracion").exists().notEmpty(), 
    check("dispositivo").exists().notEmpty(), 
    check("estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGet = [
    check("id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdate = [
    check("usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
]

const validatorGetUsuario = [
    check("usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetEmpresaId = [
    check("empresaId").exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];


module.exports = { validatorCreate, validatorGet, validatorUpdate, validatorGetUsuario, validatorGetEmpresaId };