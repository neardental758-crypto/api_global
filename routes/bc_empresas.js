const express = require('express');
const router = express.Router();
const { validatorCreateEmpresa, validatorGet, validatorGetEmail,validatorGetByName, validatorGetEmpresasWithStations } = require('../validators/empresaValidators');
const { getItems, createItem, getItem, getItemEmail, patchItem, getItemFilterOrganitationFromStation, getItemEmail_cortezza, getItemFilterOrganitationFromStation_cortezza, getUsuariosCountByOrganization, getUsuariosCount, getItemByName, getEmpresasWithStations, getUsersByStation,updateOrganization} = require('../controllers/empresa');
const authMiddleware = require('../middleware/session');

router.get("/", getItems);

router.get("/id/:emp_id", validatorGet, getItem);

router.get("/organization/:emp_id", validatorGet, getItemFilterOrganitationFromStation);

router.get("/email/:emp_email", validatorGetEmail, getItemEmail); //get por email corporativo

router.patch("/:emp_id", validatorGet, patchItem);
router.patch("/update/:emp_id", validatorGet, updateOrganization);




router.post("/registrarempresa", authMiddleware(['all']), validatorCreateEmpresa, createItem);
router.get("/nombre/:emp_nombre", validatorGetByName, getItemByName);

// routes/empresas.js
router.get("/with-stations", authMiddleware(["all"]), validatorGetEmpresasWithStations, getEmpresasWithStations);

// En tu archivo de rutas
router.get("/usuarios-count/:emp_id", authMiddleware(['all']), getUsuariosCountByOrganization);
router.get("/usuarios-total-count", authMiddleware(['all']), getUsuariosCount);

router.get("/estaciones/usuarios/:estacionId", authMiddleware(['all']), getUsersByStation);

//Router cortezza
router.get("/org_cortezza/:emp_id",authMiddleware(["external"]), validatorGet, getItemFilterOrganitationFromStation_cortezza);
router.get("/email_cortezza/:emp_email",authMiddleware(["external"]), validatorGetEmail, getItemEmail_cortezza); //get por email corporativo

module.exports = router;