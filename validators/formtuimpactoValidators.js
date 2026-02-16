const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateForm = [
        check("form_id").exists().notEmpty(),	
        check("nombre").exists().notEmpty(),	
        check("apellido").exists().notEmpty(),	
        check("email").exists().notEmpty(),	
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetForm = [
        check("form_id").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

   
    module.exports = { validatorCreateForm, validatorGetForm };
}