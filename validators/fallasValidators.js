const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateFallas = [
    check("fal_id").exists().notEmpty(),
    check("fal_estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetFallas = [
    check("fal_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];


module.exports = { validatorCreateFallas, validatorGetFallas };