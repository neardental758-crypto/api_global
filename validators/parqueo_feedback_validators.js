const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("id").exists().notEmpty(), 
    check("usuario").exists().notEmpty(),  
    check("renta_parqueo").exists().notEmpty(),  
    check("fecha").exists().notEmpty(),  
    check("comentario").exists().notEmpty(),  
    check("calificacion").exists().notEmpty(),
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


module.exports = { validatorCreate, validatorGet };