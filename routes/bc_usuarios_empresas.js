const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { validatorCreateUsuarioEmpresas, validatorUpdateUsuarioEmpresas } = require('../validators/usuarios_empresas_validators');
const { getAllUsuariosEmpresas, getUsuarioEmpresas, createUsuarioEmpresas, updateUsuarioEmpresas, deleteUsuarioEmpresas,getEmpresasAsignadas } = require('../controllers/usuarios_empresas');

    router.get("/usuarios-empresas", authMiddleware(["all"]), getAllUsuariosEmpresas);
    router.get("/usuarios-empresas/:usu_documento", authMiddleware(["all"]), getUsuarioEmpresas);
    router.post("/usuarios-empresas", authMiddleware(["all"]), validatorCreateUsuarioEmpresas, createUsuarioEmpresas);
    router.put("/usuarios-empresas/:usu_documento", authMiddleware(["all"]), validatorUpdateUsuarioEmpresas, updateUsuarioEmpresas);
    router.delete("/usuarios-empresas/:usu_documento", authMiddleware(["all"]), deleteUsuarioEmpresas);
    router.get("/empresas-asignadas/:usu_documento", authMiddleware(["all"]), getEmpresasAsignadas);


    module.exports = router;