const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateCandado = [
        check("can_id").exists().notEmpty(),
        check("can_imei").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetCandado = [
        check("can_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorGetByImei = [
        check("can_imei").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorUpdateCandado = [
        check("can_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    module.exports = { 
        validatorCreateCandado, 
        validatorGetCandado, 
        validatorGetByImei, 
        validatorUpdateCandado 
    };
}