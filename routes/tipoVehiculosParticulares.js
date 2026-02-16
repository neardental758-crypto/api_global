const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const checkRol = require('../middleware/rol');
const { validatorCreateTipoVehiculoParticular, validatorGetTipoVehiculoParticular } = require('../validators/tipoVehiculoParticularValidators');
const { getItems, getItem, createItem, deleteItem } = require('../controllers/tipoVehiculoParticular');

/**
 * las rutas de las diferentes peticiones para esta colección
 */

//petición GET trae todos los documentos de la colección
//getItems es requerido desde los controladores
//utilizamos los middleware de autMiddleware y checkRol
//autMiddleware verifica que contenga un token validatorGetUser
//checkRol verifica que el rol del usuario tenga permisos para está petición
router.get("/", 
    authMiddleware(["all"]),
    getItems);

//GET trae un documento específico
// validatorGetUser es un middleware que es requerido desde la carpeta validator
// Este validador se encarga de que la data que llega del cliente exista y no este vacía 
router.get("/id/:id", validatorGetTipoVehiculoParticular,authMiddleware(["all"]), getItem);

//POST registro de un usuario
router.post("/register", authMiddleware(["all"]), validatorCreateTipoVehiculoParticular, createItem);


//DELETE eliminar por id
router.delete("/:id", authMiddleware(["all"]), validatorGetTipoVehiculoParticular, deleteItem);
     
//exportamos el modulo
module.exports = router;