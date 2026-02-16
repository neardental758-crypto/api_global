const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateProgresoLogro = [
    check("id").exists().notEmpty(),
    check("usuario_id").exists().notEmpty(),
    check("logro_id").exists().notEmpty(),
    check("progreso").exists().notEmpty(),
    check("estado").exists().notEmpty(),
    check("ultima_actualizacion").exists().notEmpty(),

    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetProgresoLogro = [
    check("usuario_id").exists().notEmpty(),
    check("logro_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetPro_logro = [
    check("usuario_id").exists().notEmpty(),
    check("logro_id").exists().notEmpty(),
    check("estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetPro_logro_update = [
    check("usuario_id").exists().notEmpty(),
    check("estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];
const validatorGetUsuario = [
    check("usuario_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdateProgresoLogros = [
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

const validatorGetEmp = [
    check("empresa").exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorGetPro_logro,validatorGetPro_logro_update, validatorCreateProgresoLogro, validatorGetProgresoLogro, validatorUpdateProgresoLogros , validatorGetEstado, validatorGetUsuario, validatorGetEmp };
