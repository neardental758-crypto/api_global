const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateEstacion = [
        check("est_id").exists().notEmpty(),
        check("est_estacion").exists().notEmpty(),
        check("est_empresa").exists().notEmpty(),
        check("est_num_bicicleteros").exists().notEmpty(),
        check("est_habilitada").exists().notEmpty(),
        check("est_mac").exists().notEmpty(),
        check("est_electrica").exists().notEmpty(),
        check("est_horario").exists().notEmpty(),
        //check("est_distancia_renta").exists().notEmpty(),
        check("est_last_conect").exists().notEmpty(),
        check("est_puestos_intercambiables").exists().notEmpty(),
        check("est_latitud").exists().notEmpty(),
        check("est_longitud").exists().notEmpty(),
        check("est_ciudad").exists().notEmpty(),
        check("est_automatizada").exists().notEmpty(),
        check("est_direccion").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    const validatorGetUser = [
        check("est_id").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    const validatorGetNombre = [
        check("est_estacion").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetEmpresa = [
        check("est_empresa").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

const validatorUpdateEstacion = [
  check("est_id").exists().notEmpty().isNumeric(),
  check("est_estacion").optional().isLength({ min: 3, max: 50 }),
  check("est_empresa").optional().isLength({ min: 2, max: 50 }),
  check("est_num_bicicleteros").optional().isNumeric().isInt({ min: 0 }),
  check("est_habilitada").optional().isIn([0, 1]),
  check("est_mac").optional().isLength({ max: 50 }),
  check("est_electrica").optional().isIn([0, 1]),
  check("est_last_conect").optional().isString(),
  check("est_puestos_intercambiables").optional().isNumeric().isInt({ min: 0 }),
  check("est_latitud").optional().isFloat(),
  check("est_longitud").optional().isFloat(),
  check("est_ciudad").optional().isLength({ min: 2, max: 50 }),
  check("est_automatizada").optional().isIn([0, 1]),
  check("est_direccion").optional().isLength({ min: 5, max: 200 }),
  check("est_descripcion").optional().isLength({ max: 500 }),
  (req, res, next) => {
    validateResults(req, res, next);
  },
];

    module.exports = { validatorCreateEstacion, validatorGetUser, validatorGetNombre, validatorGetEmpresa, validatorUpdateEstacion};
}




