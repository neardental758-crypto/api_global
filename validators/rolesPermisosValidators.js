const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateRolPermiso = [
        check("rp_id").exists().notEmpty(),
        check("rp_rol_id").exists().notEmpty(),
        check("rp_permiso_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetRolPermiso = [
        check("rp_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorGetByRol = [
        check("rp_rol_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorDeleteRolPermiso = [
        check("rp_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    module.exports = { 
        validatorCreateRolPermiso, 
        validatorGetRolPermiso, 
        validatorGetByRol,
        validatorDeleteRolPermiso 
    };
}