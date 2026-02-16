const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateRol = [
        check("rol_id").exists().notEmpty(),
        check("rol_nombre").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetRol = [
        check("rol_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorUpdateRol = [
        check("rol_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    module.exports = { 
        validatorCreateRol, 
        validatorGetRol, 
        validatorUpdateRol 
    };
}