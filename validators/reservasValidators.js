const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateReservas = [
    check("res_id").exists().notEmpty(),
    check("res_estacion").exists().notEmpty(),
    check("res_usuario").exists().notEmpty(),	
    check("res_bicicleta").exists().notEmpty(),
    check("res_fecha_inicio").exists().notEmpty(),
    check("res_hora_inicio").exists().notEmpty(),
    check("res_fecha_fin").exists().notEmpty(),
    check("res_hora_fin").exists().notEmpty(),
    check("res_estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetReservas = [
    check("res_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdateReservas = [
    check("res_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
]

const validatorVehiculo = [
    check("res_id").exists().notEmpty(),
    check("res_bicicleta").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetUsuario = [
    check("res_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdateEstado = [
    check("res_id").exists().notEmpty(),
    check("res_estado").exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
 ];


module.exports = { validatorCreateReservas, validatorGetReservas, validatorUpdateReservas, validatorGetUsuario, validatorVehiculo, validatorUpdateEstado,  };