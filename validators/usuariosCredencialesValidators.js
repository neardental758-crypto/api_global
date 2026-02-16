const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateCredencial = [
        check("uc_id").exists().notEmpty(),
        check("uc_usuario_id").exists().notEmpty(),
        check("uc_password").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetCredencial = [
        check("uc_usuario_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorUpdateCredencial = [
        check("uc_usuario_id").exists().notEmpty(),
        check("uc_password").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    module.exports = { 
        validatorCreateCredencial, 
        validatorGetCredencial, 
        validatorUpdateCredencial 
    };
}