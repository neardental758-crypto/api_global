const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateUser = [
    (req, res, next) => {
        const b = req.body || {};
        if (b.idNumber && !b.usu_documento) b.usu_documento = b.idNumber;
        if (b.name && !b.usu_nombre) b.usu_nombre = b.name;
        if (b.email && !b.usu_email) b.usu_email = b.email;
        if (b.password && !b.usu_password) b.usu_password = b.password;
        next();
    },
    check("usu_documento").exists().notEmpty().withMessage("Documento es requerido"),
    check("usu_nombre").exists().notEmpty().withMessage("Nombre es requerido"),
    check("usu_email").exists().notEmpty().isEmail().withMessage("Email válido es requerido"),
    check("usu_password").exists().notEmpty().withMessage("Contraseña es requerida"),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorLogin = [
    check("password").exists().notEmpty(),
    check("user").optional().isString(),
    check("email").optional().isString(),
    check("usu_documento").optional().isString(),
    (req, res, next) =>{
        const b = req && req.body ? req.body : {};
        const hasIdentifier =
            (b && typeof b.user !== "undefined" && String(b.user).trim()) ||
            (b && typeof b.email !== "undefined" && String(b.email).trim()) ||
            (b && typeof b.usu_documento !== "undefined" && String(b.usu_documento).trim());
        if (!hasIdentifier) {
            return res.status(400).send({ error: "DATOS_INCOMPLETOS" });
        }
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
