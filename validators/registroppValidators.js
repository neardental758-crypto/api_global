const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("id").exists().notEmpty(),
    check("usuario").exists().notEmpty(),
    check("idViaje").exists().notEmpty(),
    check("fecha").exists().notEmpty(),
    check("vehiculo").exists().notEmpty(),
    check("distancia").exists().notEmpty(),
    check("respuestas").exists().notEmpty(),
    check("comentario").exists().notEmpty(),
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

module.exports = { validatorCreate, validatorGet  };