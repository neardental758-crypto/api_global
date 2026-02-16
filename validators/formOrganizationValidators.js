const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateFormOrganization = [
        check("idformOrganization").exists().notEmpty(),
        check("nombre").exists().notEmpty(),
        check("color1").exists().notEmpty(),
        check("color2").exists().notEmpty(),
        check("imagen").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetFormOrganization = [
        check("idformOrganization").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];


    module.exports = { validatorCreateFormOrganization, validatorGetFormOrganization };
}
