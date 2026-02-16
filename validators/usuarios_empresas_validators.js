const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const validatorCreateUsuarioEmpresas = [
    check("usu_documento")
        .exists()
        .notEmpty()
        .isString(),
    check("empresa_ids")
        .exists()
        .isArray(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorUpdateUsuarioEmpresas = [
    check("empresa_ids")
        .exists()
        .isArray(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreateUsuarioEmpresas, validatorUpdateUsuarioEmpresas };
