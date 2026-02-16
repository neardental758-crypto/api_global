const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateUser = [
    check("usu_documento").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorLogin = [
    check("usu_documento").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorPatch = [
    check("usu_documento").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetUsersByCompany = [
    check("organizationId").optional().isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];


const validatorGetUser = [
    check("usu_documento").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdateUser = [
    check("usu_documento").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
]

const validatorOrganizationId = [
    check("organizationId").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreateUser, validatorGetUser,validatorGetUsersByCompany, validatorLogin, validatorUpdateUser, validatorPatch,validatorOrganizationId };
