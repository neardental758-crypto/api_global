const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateProgresoDesafio = [
    check("id").exists().notEmpty(),
    check("usuario_id").exists().notEmpty(),
    check("desafio_id").exists().notEmpty(),
    check("progreso").exists().notEmpty(),
    check("estado").exists().notEmpty(),
    check("fecha").exists().notEmpty(),

    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetProgresoDesafio = [
    check("id").exists().notEmpty(),
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

const validatorUpdateProgresoDesafios = [
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

module.exports = { validatorCreateProgresoDesafio, validatorGetProgresoDesafio, validatorUpdateProgresoDesafios , validatorGetEstado, validatorGetUsuario };
