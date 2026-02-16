const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const validatorCreateBicycle = [
        check("bic_id").exists().notEmpty(),	
        check("bic_nombre").exists().notEmpty(),	
        check("bic_numero").exists().notEmpty(),	
        check("bic_estacion").exists().notEmpty(),	
        check("bic_estado").exists().notEmpty(),	
        check("bic_descripcion").exists().notEmpty(),	
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];
    
    const validatorGetBicycle = [
        check("bic_id").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetNumero = [
        check("bic_numero").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetNombre = [
        check("bic_estacion").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorUpdateBicycle = [
        check("bic_id").exists().notEmpty(),		
        check("bic_estado").exists().notEmpty(),
        (req, res, next) =>{
            return validateResults(req, res, next);
        }
    ];

    const validatorGetEmpresa = [
        check("empresaId").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorPatchBicycle = [
        check("bic_id").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    const validatorGetEstacion = [
        check("est_estacion").exists().notEmpty(),
        (req, res, next) => {
            return validateResults(req, res, next);
        }
    ];

    //Flota Activa o disponible
        const validatorGetPorEstado = [
            check("estado")
                .optional()
                .isIn(['DISPONIBLE', 'EN TALLER', 'RESERVADA', 'PRESTADA', 
                    'PRESTAMO PERSONALIZADO', 'CAMBIAR CLAVE', 'PRESTAMO DE EMERGENCIA'])
                .withMessage('Estado no válido'),
            (req, res, next) => {
                return validateResults(req, res, next);
            }
        ];

        // Validador para obtener bicicletas por estado y estación
        const validatorGetPorEstadoYEstacion = [
            check("estacion")
                .exists()
                .notEmpty()
                .withMessage('La estación es requerida'),
            check("estado")
                .optional()
                .isIn(['DISPONIBLE', 'EN TALLER', 'RESERVADA', 'PRESTADA', 
                    'PRESTAMO PERSONALIZADO', 'CAMBIAR CLAVE', 'PRESTAMO DE EMERGENCIA'])
                .withMessage('Estado no válido'),
            (req, res, next) => {
                return validateResults(req, res, next);
            }
        ];

        // Validador para obtener bicicletas por estado y empresa
        const validatorGetPorEstadoYEmpresa = [
            check("empresaId")
                .exists()
                .notEmpty()
                .withMessage('El ID de empresa es requerido'),
            check("estado")
                .optional()
                .isIn(['DISPONIBLE', 'EN TALLER', 'RESERVADA', 'PRESTADA', 
                    'PRESTAMO PERSONALIZADO', 'CAMBIAR CLAVE', 'PRESTAMO DE EMERGENCIA'])
                .withMessage('Estado no válido'),
            (req, res, next) => {
                return validateResults(req, res, next);
            }
        ];

        const validatorGetPorBicicleta = [
            check("bicicletaId")
              .exists()
              .notEmpty()
              .isNumeric(),
            (req, res, next) => {
              return validateResults(req, res, next);
            }
          ];

    module.exports = { validatorCreateBicycle, validatorGetBicycle, validatorGetNombre, validatorGetNumero,
         validatorUpdateBicycle, validatorGetEmpresa, validatorPatchBicycle, validatorGetEstacion, 
         validatorGetPorEstado, validatorGetPorEstadoYEstacion, validatorGetPorEstadoYEmpresa,validatorGetPorBicicleta,
        };
}




