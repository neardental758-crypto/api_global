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
    check("participante").exists().notEmpty(),
    check("actividad").exists().notEmpty(),
    check("tiempo").exists().notEmpty(),
    check("velocidad").exists().notEmpty(),
    check("puesto").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
]

module.exports = { 
    validatorID, 
    validatorCreate
};