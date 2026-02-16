const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { param } = require('express-validator');

const validatorCreateLogros = [
    check("id_logro").exists().notEmpty(),
    check("descripcion").exists().notEmpty(),
    check("fecha_creacion").exists().notEmpty(),
    check("imagen").exists().notEmpty(),
    check("estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetLogro = [
    check("id_logro").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdateLogros = [
    param("id_logro").exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];
const validatorGetEstado = [
    check("estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorCreateLogro = [
    check("descripcion").exists().notEmpty(),
    check("estado").exists().notEmpty(),
    check("imagen").optional(),
    check("fecha_creacion").exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreateLogros, validatorGetLogro, validatorUpdateLogros , validatorGetEstado, validatorCreateLogro };
