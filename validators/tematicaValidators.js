const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorID = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorCreate = [
    check("nombre_tematica").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
]

module.exports = { 
    validatorID, 
    validatorCreate
};