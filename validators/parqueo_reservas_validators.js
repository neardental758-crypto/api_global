const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateReservas = [
    check("id").exists().notEmpty(),
    check("usuario").exists().notEmpty(),	
    check("parqueadero").exists().notEmpty(),
    check("lugar_parqueo").exists().notEmpty(),
    check("fecha").exists().notEmpty(),
    check("hora_inicio").exists().notEmpty(),
    check("hora_fin").exists().notEmpty(),
    check("dispositivo").exists().notEmpty(),
    check("estado").exists().notEmpty(),

    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetReservas = [
    check("id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdateReservas = [
    check("usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
]

const validatorVehiculo = [
    check("id").exists().notEmpty(),
    check("lugar_parqueo").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetUsuario = [
    check("usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdateEstado = [
    check("id").exists().notEmpty(),
    check("estado").exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
 ];


module.exports = { validatorCreateReservas, validatorGetReservas, validatorUpdateReservas, validatorGetUsuario, validatorVehiculo, validatorUpdateEstado,  };