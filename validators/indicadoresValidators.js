const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("ind_id").exists().notEmpty(),
    check("ind_usuario").exists().notEmpty(),	
    check("ind_viaje").exists().notEmpty(),	
    check("ind_modulo").exists().notEmpty(),
    check("ind_duracion").exists().notEmpty(),	
    check("ind_distancia").exists().notEmpty(),
    check("ind_calorias").exists().notEmpty(),	
    check("ind_co2").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetTrip = [
    check("ind_viaje").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetUser = [
    check("ind_usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetId = [
    check("ind_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];


module.exports = { validatorCreate, validatorGetTrip, validatorGetId, validatorGetUser };