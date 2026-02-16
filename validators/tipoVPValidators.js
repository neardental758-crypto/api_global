const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreate = [
        check("tip_id").exists().notEmpty(),
        check("tip_nombre").exists().notEmpty(),
        check("tip_estado").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    const validatorGet = [
        check("tip_id").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    module.exports = { validatorCreate, validatorGet };
}




