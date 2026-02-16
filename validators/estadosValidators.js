const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateEstados = [
    check("est_id").exists().notEmpty(),
    check("est_estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetEstado = [
    check("est_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];


module.exports = { validatorCreateEstados, validatorGetEstado };