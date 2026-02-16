const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("tic_id").exists().notEmpty(),
    check("tic_usuario").exists().notEmpty(),
    check("tic_comentario").exists().notEmpty(),
    check("tic_respuesta").exists().notEmpty(),
    check("tic_fecha_creacion").exists().notEmpty(),
    check("tic_fecha_respuesta").exists().notEmpty(),
    check("tic_estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGet = [
    check("tic_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];


module.exports = { validatorCreate, validatorGet };