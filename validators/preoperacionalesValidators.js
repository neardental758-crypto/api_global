const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("id").exists().notEmpty(),
    check("usuario").exists().notEmpty(),	
    check("idViaje").exists().notEmpty(),	
    check("modulo").exists().notEmpty(),
    check("respuestas").exists().notEmpty(),	
    check("comentario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetTrip = [
    check("idViaje").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetUser = [
    check("usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetId = [
    check("id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetPrestamos = [
    check("prestamosIds")
        .exists()
        .isArray()
        .notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];


module.exports = { validatorCreate, validatorGetTrip, validatorGetId, validatorGetUser , validatorGetPrestamos };