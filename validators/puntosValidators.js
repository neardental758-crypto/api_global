const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreatePuntos = [
    check("pun_id").exists().notEmpty(),
    check("pun_usuario").exists().notEmpty(),
    check("pun_modulo").exists().notEmpty(),
    check("pun_fecha").exists().notEmpty(),
    check("pun_puntos").exists().notEmpty(),
    check("pun_motivo").exists().notEmpty(),
    
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetUser = [
    check("pun_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetEmpresa = [
    check("empresa").exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreatePuntos, validatorGetUser, validatorGetEmpresa };