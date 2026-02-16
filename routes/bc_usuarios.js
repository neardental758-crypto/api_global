const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { validatorCreateUser, validatorGetUser, validatorLogin, validatorUpdateUser, validatorPatch, validatorOrganizationId } = require('../validators/usersValidators');
const { getItems, getItem, changeNames, createItem, deleteItem,
    login, correo__password_ride, correo__password_meb, generateTokenForOrganization, updateItem, patchItem, patchOrganization, getItems_cortezza, getItem_cortezza, createUserComplete , getOperarios, checkUserExists,getUsersByOrganization} = require('../controllers/usuario');
/**
 * las rutas de las diferentes peticiones para esta colección
 */

//petición GET trae todos los documentos de la colección
//getItems es requerido desde los controladores
//utilizamos los middleware de autMiddleware y checkRol
//autMiddleware verifica que contenga un token validatorGetUser
router.get("/", authMiddleware(["all"]), getItems);

//GET trae un documento específico 
// validatorGetUser es un middleware que es requerido desde la carpeta validator
// Este validador se encarga de que la data que llega del cliente exista y no este vacía 

//router.get("/:id", validatorGetUser, authMiddleware(["all"]), checkRol(['admin']),  getItem); //linea original
router.get("/id/:usu_documento", authMiddleware(["all"]), validatorGetUser, getItem);

//POST registro de un usuario
router.post("/registrar", authMiddleware(["all"]), validatorCreateUser, createItem);

router.post("/updateusuario", authMiddleware(["all"]), validatorUpdateUser, updateItem);

router.post("/login", authMiddleware(["all"]), validatorLogin, login);

router.post("/correo_password_ride", correo__password_ride);
router.post("/correo_password_meb", correo__password_meb);

// router.post("/loginCortezza", generateTokenForOrganization);

router.patch("/:usu_documento", authMiddleware(["all"]), validatorPatch, patchItem);  ///error revisar

router.patch("/empresa/:usu_documento", authMiddleware(["all"]), validatorPatch, patchOrganization);

router.post('/create_user_complete',authMiddleware(["all"]), createUserComplete);

router.get('/operarios',authMiddleware(["all"]),  getOperarios);

router.get('/check_exists/:idNumber', authMiddleware(["all"]), checkUserExists);

router.get("/by-organization/:emp_nombre", authMiddleware(["all"]), getUsersByOrganization);

// Add this route to your router file

router.delete("/:id", authMiddleware(["all"]), validatorGetUser, deleteItem);

//Router cortezza
router.get("/all", authMiddleware(["external"]), getItems_cortezza);
router.get("/id_cortezza/:usu_documento", authMiddleware(["external"]), validatorGetUser, getItem_cortezza);
//exportamos el modulo
module.exports = router;