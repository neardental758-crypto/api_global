const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("com_id").exists().notEmpty(),
    check("com_usuario").exists().notEmpty(),
    check("com_prestamo").exists().notEmpty(),
    check("com_fecha").exists().notEmpty(),
    check("com_comentario").exists().notEmpty(),
    check("com_estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGet = [
    check("com_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];


module.exports = { validatorCreate, validatorGet };