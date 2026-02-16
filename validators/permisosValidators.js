const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreatePermiso = [
        check("per_id").exists().notEmpty(),
        check("per_componente_pantalla").exists().notEmpty(),
        check("per_funcionalidad").exists().notEmpty(),
        check("per_tipo").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetPermiso = [
        check("per_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorUpdatePermiso = [
        check("per_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    module.exports = { 
        validatorCreatePermiso, 
        validatorGetPermiso, 
        validatorUpdatePermiso 
    };
}