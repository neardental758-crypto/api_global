const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateDesafios = [
    check("id_desafio").exists().notEmpty(),
    check("descripcion").exists().notEmpty(),
    check("valor").exists().notEmpty(),
    check("fecha_creacion").exists().notEmpty(),
    check("estado").exists().notEmpty(),
    check("criterios").exists().notEmpty(),
    check("fecha_inicio").exists().notEmpty(),
    check("fecha_fin").exists().notEmpty(),

    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetDesafio = [
    check("id_desafio").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorUpdateDesafios = [
  check("id_desafio").exists().notEmpty(),
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

module.exports = { validatorCreateDesafios, validatorGetDesafio, validatorUpdateDesafios , validatorGetEstado };
