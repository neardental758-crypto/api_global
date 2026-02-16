const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateBicicleteros = [
        // check("bro_id").exists().notEmpty(),
        check("bro_nombre").exists().notEmpty(),
        check("bro_estacion").exists().notEmpty(),
        check("bro_numero").exists().notEmpty(),
        check("bro_bicicleta").exists().notEmpty(),
        check("bro_bluetooth").exists().notEmpty(),
        check("bro_clave").exists().notEmpty(),	
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetBicicleteros = [
        check("bro_id").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetClave = [
        check("bro_estacion").exists().notEmpty(),
        check("bro_bicicleta").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetKEY = [
        check("bro_id").exists().notEmpty(),
        check("bro_clave").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
   
    module.exports = { validatorCreateBicicleteros, validatorGetBicicleteros, validatorGetClave, validatorGetKEY };
}




