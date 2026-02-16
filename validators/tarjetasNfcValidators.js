const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateTarjeta = [
        check("tnfc_id").exists().notEmpty(),
        check("tnfc_numero_tarjeta").exists().notEmpty().isNumeric(),
        check("tnfc_id_hexadecimal").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetTarjeta = [
        check("tnfc_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorGetByHexadecimal = [
        check("tnfc_id_hexadecimal").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorGetByUsuario = [
        check("tnfc_usuario_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorUpdateTarjeta = [
        check("tnfc_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    module.exports = { 
        validatorCreateTarjeta, 
        validatorGetTarjeta, 
        validatorGetByHexadecimal,
        validatorGetByUsuario,
        validatorUpdateTarjeta 
    };
}