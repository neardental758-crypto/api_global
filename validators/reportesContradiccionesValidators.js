const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateReporte = [
    check("rep_estacion").exists().notEmpty(),
    check("rep_bicicleta_numero").exists().notEmpty(),
    check("rep_tecnico_documento").exists().notEmpty(),
    check("rep_comentario").exists().notEmpty(),
    check("rep_bicicleta_id").optional().isNumeric(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorUpdateReporte = [
    check("rep_id").exists().notEmpty().isNumeric(),
    check("estado").exists().notEmpty().isIn(['PENDIENTE', 'RECIBIDO', 'EN_PROCESO', 'FINALIZADO']),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreateReporte, validatorUpdateReporte };
