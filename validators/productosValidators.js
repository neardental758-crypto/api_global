const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { param } = require('express-validator');

const validatorCreateProductos = [
    check("id_producto").exists().notEmpty().optional(),
    check("nombre").exists().notEmpty(),
    check("empresa").exists().notEmpty(),
    check("descripcion").exists().notEmpty(),
    check("cantidad").exists().notEmpty(),
    check("valor").exists().notEmpty(),
    check("nivel").exists().notEmpty(),
    check("imagen").exists().notEmpty(),
    check("estado").exists().notEmpty(),
    check("fecha_creacion").exists().notEmpty(),

    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorGetProducto = [
    check("id_producto").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorPatchProducto = [
    param("id_producto").exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];
const validatorGetNombre = [
    check("nombre").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];
const validatorGetEmp = [
    check("empresa").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];
const validatorUpdateProductos = [
  check("id_producto").exists().notEmpty(),
  (req, res, next) =>{
      return validateResults(req, res, next);
  }
]


module.exports = { validatorCreateProductos, validatorGetProducto, validatorUpdateProductos , validatorGetNombre, validatorGetEmp, validatorPatchProducto };
