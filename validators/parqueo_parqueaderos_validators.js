const { check, param} = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreate = [
        check("id").exists().notEmpty(),
        check("nombre").exists().notEmpty(), 
        check("empresa").exists().notEmpty(), 
        check("capacidad").exists().notEmpty(), 
        check("latitud").exists().notEmpty(), 
        check("longitud").exists().notEmpty(), 
        check("direccion").exists().notEmpty(), 
        check("ciudad").exists().notEmpty(), 
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

    const validatorGetEmpresa = [
        check("empresa").exists().notEmpty(),
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

const validatorUpdate = [
    check("id")
        .exists()
        .notEmpty(),
    check("nombre")
        .optional()
        .notEmpty(),
    check("empresa")
        .optional()
        .notEmpty(),
    check("capacidad")
        .optional()
        .notEmpty(),
    check("latitud")
        .optional()
        .notEmpty(),
    check("longitud")
        .optional()
        .notEmpty(),
    check("direccion")
        .optional()
        .notEmpty(),
    check("ciudad")
        .optional()
        .notEmpty(),
    check("estado")
        .optional()
        .notEmpty(),
    check("distancia_mts")
        .optional()
        .isNumeric(),
    check("duracion_reserva_min")
        .optional()
        .isNumeric(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorCreatePuntosMasivo = [
    check("parqueaderoId")
        .exists()
        .notEmpty()
        .isString(),
    check("puntosCarga")
        .exists()
        .isArray()
        .notEmpty(),
    check("puntosCarga.*.numero")
        .exists()
        .notEmpty(),
    check("puntosCarga.*.voltaje")
        .exists()
        .notEmpty()
        .isInt(),
    check("puntosCarga.*.estado")
        .exists()
        .notEmpty()
        .isIn(['DISPONIBLE', 'OCUPADO', 'RESERVADO', 'MANTENIMIENTO']),
    check("puntosCarga.*.clave")
        .exists()
        .notEmpty()
        .isString(),
    check("puntosCarga.*.qr")
        .exists()
        .notEmpty()
        .isString(),
    check("puntosCarga.*.bluetooth")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorUpdatePuntosMasivo = [
    check("parqueaderoId")
        .exists()
        .notEmpty()
        .isString(),
    check("puntosCarga")
        .exists()
        .isArray()
        .notEmpty(),
    check("puntosCarga.*.numero")
        .optional()
        .isNumeric(),
    check("puntosCarga.*.voltaje")
        .exists()
        .notEmpty()
        .isNumeric(),
    check("puntosCarga.*.estado")
        .exists()
        .notEmpty()
        .isIn(['DISPONIBLE', 'OCUPADO', 'RESERVADO', 'MANTENIMIENTO', "INHABILITADO"]),
    check("puntosCarga.*.clave")
        .optional()
        .isString(),
    check("puntosCarga.*.qr")
        .exists()
        .notEmpty()
        .isString(),
    check("puntosCarga.*.bluetooth")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorGetPuntosCarga = [
    check("parqueaderoId")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorGetHorarios = [
    param("parqueaderoId")
        .exists()
        .notEmpty()
        .isString(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorCreateHorariosMasivo = [
    check("parqueaderoId")
        .exists()
        .notEmpty()
        .isString(),
    check("horarios")
        .exists()
        .isObject(),
    check("horarios.hor_mon")
        .optional({ nullable: true })
        .custom((value) => {
            return value === null || value === "" || typeof value === 'string';
        })
        .customSanitizer((value) => value || ""), // Convierte null a ""
    check("horarios.hor_tue")
        .optional({ nullable: true })
        .custom((value) => {
            return value === null || value === "" || typeof value === 'string';
        })
        .customSanitizer((value) => value || ""),
    check("horarios.hor_wed")
        .optional({ nullable: true })
        .custom((value) => {
            return value === null || value === "" || typeof value === 'string';
        })
        .customSanitizer((value) => value || ""),
    check("horarios.hor_thu")
        .optional({ nullable: true })
        .custom((value) => {
            return value === null || value === "" || typeof value === 'string';
        })
        .customSanitizer((value) => value || ""),
    check("horarios.hor_fri")
        .optional({ nullable: true })
        .custom((value) => {
            return value === null || value === "" || typeof value === 'string';
        })
        .customSanitizer((value) => value || ""),
    check("horarios.hor_sat")
        .optional({ nullable: true })
        .custom((value) => {
            return value === null || value === "" || typeof value === 'string';
        })
        .customSanitizer((value) => value || ""),
    check("horarios.hor_sun")
        .optional({ nullable: true })
        .custom((value) => {
            return value === null || value === "" || typeof value === 'string';
        })
        .customSanitizer((value) => value || ""),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];


const validatorUpdateHorariosMasivo = [
    check("parqueaderoId")
        .exists()
        .notEmpty()
        .isString(),
    check("horarios")
        .exists()
        .isObject(),
    check("horarios.hor_mon")
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null || value === "" || typeof value === 'string') {
                return true;
            }
            throw new Error('Valor inválido para horario');
        }),
    check("horarios.hor_tue")
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null || value === "" || typeof value === 'string') {
                return true;
            }
            throw new Error('Valor inválido para horario');
        }),
    check("horarios.hor_wed")
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null || value === "" || typeof value === 'string') {
                return true;
            }
            throw new Error('Valor inválido para horario');
        }),
    check("horarios.hor_thu")
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null || value === "" || typeof value === 'string') {
                return true;
            }
            throw new Error('Valor inválido para horario');
        }),
    check("horarios.hor_fri")
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null || value === "" || typeof value === 'string') {
                return true;
            }
            throw new Error('Valor inválido para horario');
        }),
    check("horarios.hor_sat")
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null || value === "" || typeof value === 'string') {
                return true;
            }
            throw new Error('Valor inválido para horario');
        }),
    check("horarios.hor_sun")
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null || value === "" || typeof value === 'string') {
                return true;
            }
            throw new Error('Valor inválido para horario');
        }),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];



    module.exports = { validatorCreate, validatorGetId, validatorGetEmpresa, validatorGetEmpresaId, validatorUpdate,
        validatorCreatePuntosMasivo,
        validatorUpdatePuntosMasivo,
        validatorGetPuntosCarga,
        validatorGetHorarios,
        validatorCreateHorariosMasivo,
        validatorUpdateHorariosMasivo


     };
}




