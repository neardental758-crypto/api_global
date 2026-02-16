const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator'); // Sin llaves y con 's'

const validatorCreatePush = [
    check('token')
        .exists()
        .withMessage('El token del dispositivo es requerido')
        .notEmpty()
        .withMessage('El token no puede estar vacío')
        .isString()
        .withMessage('El token debe ser un string'),
    
    check('body')
        .exists()
        .withMessage('El mensaje es requerido')
        .notEmpty()
        .withMessage('El mensaje no puede estar vacío')
        .isString()
        .withMessage('El mensaje debe ser un string'),
    
    check('title')
        .optional()
        .isString()
        .withMessage('El título debe ser un string'),
    
    check('data')
        .optional()
        .isObject()
        .withMessage('Data debe ser un objeto'),
    
    validateResults  // Cambiado de validateResult a validateResults
];

const validatorCreatePushMultiple = [
    check('tokens')
        .exists()
        .withMessage('Los tokens son requeridos')
        .isArray()
        .withMessage('tokens debe ser un array')
        .notEmpty()
        .withMessage('El array de tokens no puede estar vacío'),
    
    check('body')
        .exists()
        .withMessage('El mensaje es requerido')
        .notEmpty()
        .withMessage('El mensaje no puede estar vacío')
        .isString()
        .withMessage('El mensaje debe ser un string'),
    
    check('title')
        .optional()
        .isString()
        .withMessage('El título debe ser un string'),
    
    check('data')
        .optional()
        .isObject()
        .withMessage('Data debe ser un objeto'),
    
    validateResults  // Cambiado de validateResult a validateResults
];

module.exports = { 
    validatorCreatePush,
    validatorCreatePushMultiple 
};