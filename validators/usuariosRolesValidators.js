const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateUsuarioRol = [
        check("ur_id").exists().notEmpty(),
        check("ur_usuario_id").exists().notEmpty(),
        check("ur_rol_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetUsuarioRol = [
        check("ur_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorGetByUsuario = [
        check("ur_usuario_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorDeleteUsuarioRol = [
        check("ur_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    module.exports = { 
        validatorCreateUsuarioRol, 
        validatorGetUsuarioRol, 
        validatorGetByUsuario,
        validatorDeleteUsuarioRol 
    };
}