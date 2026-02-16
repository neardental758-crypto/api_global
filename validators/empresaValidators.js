const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateEmpresa = [
        check("emp_id").exists().notEmpty(),
        check("emp_nombre").exists().notEmpty(),
        check("emp_email").exists().notEmpty(),
        check("emp_estado").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    const validatorGet = [
        check("emp_id").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    const validatorGetEmail = [
        check("emp_email").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetByName = [
        check("emp_nombre")
            .exists()
            .notEmpty()
            .isString(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorGetEmpresasWithStations = [
        // No necesita validación específica ya que es un GET sin parámetros requeridos
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    module.exports = { validatorCreateEmpresa, validatorGet, validatorGetEmail, validatorGetByName, validatorGetEmpresasWithStations,};
}




