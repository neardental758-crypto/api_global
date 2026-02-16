const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorID = [
    check("id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];


const validatorCreate = [
    check("id").exists().notEmpty(),
    check("nombre").exists().notEmpty(),
    check("fechaCreacion").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
]

module.exports = { 
    validatorID, 
    validatorCreate
};