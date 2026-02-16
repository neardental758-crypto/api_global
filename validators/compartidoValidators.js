const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorId = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdConductor = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];
const validatorIdPasajero = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdSolicitud = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorviajeSolicitud = [
    check("idViajeSolicitado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorSolicitante = [
    check("idSolicitante").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdVehiculo = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdViajeActivo = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorDocument = [
    check("conductor").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorVehiculeUpdate = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdPenalizacion = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdIndicadores = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorConductorViajeActivo = [
    check("conductor").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorOrganizacionViajeActivo = [
    check("idOrganizacion").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorDocumentToken = [
    check("documento").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorEmailToken = [
    check("email").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdPagos = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdComentarios = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdCalificacion = [
    check("idCalificacion").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorOrganizationId = [
    check("organizationId").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];


const validatorIdViaje = [
    check("idViaje").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorRegisterPago = [
    check("_id").exists().notEmpty(),
    check("idViaje").exists().notEmpty(),
    check("idConductor").exists().notEmpty(),
    check("idPasajero").exists().notEmpty(),
    check("valor").exists().notEmpty(),
    check("estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
]

const validatorCreateComentarios = [
    check("_id").exists().notEmpty(),
    check("idEnvio").exists().notEmpty(),
    check("idRecibido").exists().notEmpty(),
    check("relacion").exists().notEmpty(),
    check("calificacion").exists().notEmpty(),
    check("comentario").exists().notEmpty(),
    check("idViaje").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorSolicitudNoEncontrada = [
    check("id").exists().notEmpty(),
    check("idSolicitante").exists().notEmpty(),
    check("fechaSolicitud").exists().notEmpty(),
    check("posicion1").exists().notEmpty(),
    check("posicion2").exists().notEmpty(),
    check("estado").exists().notEmpty(),
    check("fechaCreacion").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdSolicitudPendPatch = [
    check("id").exists().notEmpty(),
    check("estado").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdSolicitudPend = [
    check("id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdContratos = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];

const validatorIdOficinas = [
    check("_id").exists().notEmpty(),
    (req, res, next) =>{
        return validateResults(req, res, next);
    }
];


module.exports = { 
    validatorId, 
    validatorIdConductor, 
    validatorIdPasajero, 
    validatorIdSolicitud, 
    validatorIdVehiculo, 
    validatorIdViajeActivo, 
    validatorVehiculeUpdate, 
    validatorIdPenalizacion, 
    validatorIdIndicadores, 
    validatorConductorViajeActivo, 
    validatorOrganizacionViajeActivo, 
    validatorIdPagos,
    validatorRegisterPago, 
    validatorIdComentarios,
    validatorIdCalificacion,
    validatorCreateComentarios,
    validatorSolicitante,
    validatorviajeSolicitud,
    validatorDocumentToken,
    validatorEmailToken,
    validatorIdViaje,
    validatorDocument,
    validatorOrganizationId,
    validatorIdContratos,
    validatorIdOficinas,
    validatorSolicitudNoEncontrada,
    validatorIdSolicitudPend,
    validatorIdSolicitudPendPatch
};