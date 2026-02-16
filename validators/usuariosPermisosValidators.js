const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateUsuarioPermiso = [
        check("up_id").exists().notEmpty(),
        check("up_usuario_id").exists().notEmpty(),
        check("up_permiso_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetUsuarioPermiso = [
        check("up_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorGetByUsuario = [
        check("up_usuario_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorDeleteUsuarioPermiso = [
        check("up_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    module.exports = { 
        validatorCreateUsuarioPermiso, 
        validatorGetUsuarioPermiso, 
        validatorGetByUsuario,
        validatorDeleteUsuarioPermiso 
    };
}