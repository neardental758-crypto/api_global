const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreate = [
        check("id").exists().notEmpty(),
        check("numero").exists().notEmpty(),  
        check("parqueadero").exists().notEmpty(),  
        check("bluetooth").exists().notEmpty(),  
        check("qr").exists().notEmpty(),  
        check("clave").exists().notEmpty(),  
        check("voltaje").exists().notEmpty(),
        check("estado").exists().notEmpty(), 
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetId = [
        check("id").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetNumero = [
        check("numero").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetQR = [
        check("qr").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetParqueadero = [
        check("parqueadero").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetBluetooth = [
        check("bluetooth").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorUpdateLugar = [
        check("id").exists().notEmpty(),
        check("estado").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetEmpresaId = [
    check("empresaId")
        .exists()
        .notEmpty()
        .isLength({ min: 3, max: 99 }),
    (req, res, next) => {
        return validateResults(req, res, next);
    },
];

const validatorUpdateElectroHub = [
    check("id")
        .exists()
        .notEmpty(),
    check("numero")
        .exists()
        .notEmpty(),
    check("parqueadero")
        .exists()
        .notEmpty(),
    check("bluetooth")
        .exists()
        .notEmpty(),
    check("qr")
        .exists()
        .notEmpty(),
    check("clave")
        .exists()
        .notEmpty(),
    check("bluetooth")
        .exists()
        .notEmpty(),
    check("estado")
        .exists()
        .notEmpty(),
    check("voltaje")
        .exists()
        .notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

    module.exports = { validatorCreate, validatorGetId, validatorGetParqueadero, validatorGetNumero, validatorGetQR, validatorUpdateLugar, validatorGetEmpresaId , validatorUpdateElectroHub, validatorGetBluetooth };
}




