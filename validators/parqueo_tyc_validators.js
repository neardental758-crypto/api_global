const { check, param, body} = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreate = [
    check("usuario").exists().notEmpty(), 
    check("fecha_inscripcion").exists().notEmpty(),
    check("ultimo_vehiculo").exists().notEmpty(),
    check("telefono").exists().notEmpty(),
    check("email").exists().notEmpty(),
    check("saldo").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validator_update = [
    check("usuario").exists().notEmpty(), 
    check("ultimo_vehiculo").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validator_update_saldo = [
    check("usuario").exists().notEmpty(), 
    check("saldo").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorID = [
    check("usuario").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetOrganizacion = [
    check("idOrganizacion")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorUpdateUsuario = [
    param("usuario")
        .exists()
        .notEmpty()
        .isString(),
    body("saldo")
        .exists()
        .notEmpty()
        .isNumeric()
        .isInt({ min: 0 }),
    body("estado")
        .exists()
        .notEmpty()
        .isString()
        .isIn(['activo', 'inactivo'])
        .withMessage('El estado debe ser "activo" o "inactivo"'),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorMassiveUpdateSaldos = [
    check("updates")
        .exists()
        .isArray()
        .withMessage("Updates debe ser un array"),
    check("updates.*.documento")
        .exists()
        .notEmpty()
        .withMessage("Documento es requerido"),
    check("updates.*.nuevoSaldo")
        .exists()
        .isNumeric()
        .withMessage("Nuevo saldo debe ser numérico"),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreate, validatorID, validator_update, validator_update_saldo, validatorGetOrganizacion, validatorUpdateUsuario,validatorMassiveUpdateSaldos};