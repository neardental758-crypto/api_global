const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorCreateSession = [
    check("usu_documento")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorCloseSession = [
    check("usu_documento")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorCreateSession, validatorCloseSession };