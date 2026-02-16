const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("via_id").exists().notEmpty(),
    check("via_usuario").exists().notEmpty(),
    check("via_vehiculo").exists().notEmpty(),
    check("via_partida").exists().notEmpty(), 
    check("via_llegada").exists().notEmpty(), 
    check("via_fecha_creacion").exists().notEmpty(), 
    check("via_duracion").exists().notEmpty(), 
    check("via_kilometros").exists().notEmpty(), 
    check("via_calorias").exists().notEmpty(), 
    check("via_co2").exists().notEmpty(), 
    check("via_img").exists().notEmpty(), 
    check("via_estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGet = [
    check("via_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetTrip = [
    check("via_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdate = [
    check("via_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
]

const validatorVehiculo = [
    check("via_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetUsuario = [
    check("via_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetVehiculoUsuario = [
    check("via_id").exists().notEmpty(),
    check("via_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

module.exports = { 
    validatorCreate, 
    validatorGet, 
    validatorUpdate, 
    validatorGetUsuario, 
    validatorVehiculo, 
    validatorGetVehiculoUsuario,
    validatorGetTrip 
};
