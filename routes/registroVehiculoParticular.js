const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const checkRol = require('../middleware/rol');
const { validatorCreateRegistroVehiculoParticular, validatorGetRegistroVehiculoParticular } = require('../validators/registroVehiculoParticularValidators');
const { getItems, getItem, createItem, deleteItem, getItemBuscar } = require('../controllers/registroVehiculoParticular');

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
    //checkRol(['admin']), 
    getItems);

//GET trae un documento específico
// validatorGetUser es un middleware que es requerido desde la carpeta validator
// Este validador se encarga de que la data que llega del cliente exista y no este vacía 
router.get("/id/:id", authMiddleware(["all"]), validatorGetRegistroVehiculoParticular, getItem);

// buscar documento en la colleción registro tipoVehiculoParticular
router.get("/buscarDoc/doc", authMiddleware(["all"]), validatorGetRegistroVehiculoParticular, getItemBuscar);

//POST registro de un usuario
router.post("/register", authMiddleware(["all"]), validatorCreateRegistroVehiculoParticular, createItem);


//DELETE eliminar por id
router.delete("/:id", authMiddleware(["all"]), validatorGetRegistroVehiculoParticular, deleteItem);
     
//exportamos el modulo
module.exports = router;