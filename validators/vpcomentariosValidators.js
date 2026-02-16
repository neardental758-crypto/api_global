const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("com_id").exists().notEmpty(),
    check("com_usuario").exists().notEmpty(),
    check("com_comentario").exists().notEmpty(),
    check("com_calificacion").exists().notEmpty(), 
    check("com_fecha").exists().notEmpty(), 
    check("com_id_viaje").exists().notEmpty(), 
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUsuario = [
    check("com_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorId = [
    check("com_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

module.exports = { 
    validatorCreate, 
    validatorId,
    validatorUsuario
};
