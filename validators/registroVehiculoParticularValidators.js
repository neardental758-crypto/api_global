const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateRegistroVehiculoParticular = [
    check("codigoQR").exists().notEmpty(),
    check("tipo").exists().notEmpty(),
    check("marca").exists().notEmpty(),
    check("modelo").exists().notEmpty(),
    check("color").exists().notEmpty(),
    check("serial").exists().notEmpty(),
    
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetRegistroVehiculoParticular = [
    check("id").exists().notEmpty().isMongoId(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreateRegistroVehiculoParticular, validatorGetRegistroVehiculoParticular };