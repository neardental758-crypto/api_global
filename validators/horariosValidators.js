const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateHorarios = [
        check("hor_id").exists().notEmpty(),
        check("hor_empresa").exists().notEmpty(),
        check("hor_mon").exists().notEmpty(),
        check("hor_tue").exists().notEmpty(),
        check("hor_wed").exists().notEmpty(),
        check("hor_thu").exists().notEmpty(),
        check("hor_fri").exists().notEmpty(),
        check("hor_sat").exists().notEmpty(),
        check("hor_sun").exists().notEmpty(),        
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetHorarios = [
        check("hor_id").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetNombre = [
        check("hor_empresa").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    module.exports = { validatorCreateHorarios, validatorGetHorarios, validatorGetNombre };
}




