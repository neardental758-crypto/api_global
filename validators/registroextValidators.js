const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateRegistoExt = [
    check("idUser").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetUser = [
    check("idUser").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreateRegistoExt, validatorGetUser  };