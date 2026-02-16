const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateTipoVehiculoParticular = [
    check("nombre").exists().notEmpty(),
    
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetTipoVehiculoParticular = [
    check("id").exists().notEmpty().isMongoId(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreateTipoVehiculoParticular, validatorGetTipoVehiculoParticular };