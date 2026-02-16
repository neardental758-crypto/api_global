const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');


const validatorCreateLogros = [
    check("id").exists().notEmpty(),
    check("idEmpresa").exists().notEmpty(),
    check("idLogro").exists().notEmpty(),
    check("valor").exists().notEmpty(),
    check("meta").exists().notEmpty(),
    check("puntosGanar").exists().notEmpty(),
    check("inicio").exists().notEmpty(),
    check("fin").exists().notEmpty(),
    check("fechaCreacion").exists().notEmpty(),
    check("estado").exists().notEmpty(),

    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetLogro = [
    check("id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetLogroEmp = [
    check("idEmpresa").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdateLogros = [
  check("id").exists().notEmpty(),
  (req, res, next) =>{
      return validateResults(req, res, next);
  }
]

const validatorGetEstado = [
    check("estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorCreateItem = [
    check("idEmpresa").exists().notEmpty(),
    check("idLogro").exists().notEmpty(),
    check("meta").exists().isNumeric(),
    (req, res, next) => {
        validateResults(req, res, next)
    }
];


module.exports = { validatorCreateLogros, validatorGetLogro, validatorUpdateLogros , validatorGetEstado, validatorGetLogroEmp, validatorCreateItem};
