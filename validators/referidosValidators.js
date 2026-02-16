const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("usuario").exists().notEmpty(),
    check("codigo").exists().notEmpty(),
    check("fecha_creacion").exists().notEmpty(),
    check("referente").exists().notEmpty(),
    
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGet = [
    check("usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetCod = [
    check("codigo").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];
module.exports = { validatorCreate, validatorGet, validatorGetCod };