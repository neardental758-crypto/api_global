const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreatePenalizacion = [
        check("pen_id").exists().notEmpty(),
        check("pen_tipo_penalizacion").exists().notEmpty(),
        check("pen_novedad").exists().notEmpty(),
        check("pen_usuario").exists().notEmpty(),
        check("pen_fecha_creacion").exists().notEmpty(),
        check("pen_fecha_tiempo_ok").exists().notEmpty(),
        check("pen_fecha_dinero_ok").exists().notEmpty(),
        check("pen_estado").exists().notEmpty(),
        check("pen_fecha_apelado").exists().notEmpty(),
        check("pen_motivo_apelado").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    const validatorGetPenalizacion = [
        check("pen_id").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetUsuario = [
        check("pen_usuario").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    
    module.exports = { validatorCreatePenalizacion, validatorGetPenalizacion, validatorGetUsuario };
}




