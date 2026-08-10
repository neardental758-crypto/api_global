const { matchedData } = require('express-validator');
const { TyCParqueoModels, usuarioModels, empresaModels, rentaParqueoModels} = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');
const Lugar_parqueo = require('../models/mysql/parqueo_lugar');
const Parqueaderos = require('../models/mysql/parqueo_parqueaderos');
const VpusuariosModels = require('../models/mysql/vpusuario');


const getItems = async (req, res) => {
    try {
        const data = await TyCParqueoModels.findAll({});
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_TYC_PARQUEO");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { usuario } = req;

        // Buscar el registro por su clave primaria
        const data = await TyCParqueoModels.findByPk(usuario);

        // Verificar si el registro existe
        const response = data ? 1 : 0;
        res.send({ response, data });
    } catch (e) {
        console.error("Error:", e);
        httpError(res, "ERROR_GET_TYC_PARQUEO");
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req;
        // Crear el registro en la base de datos
        const data = await TyCParqueoModels.create(body);
        // Enviar una respuesta de éxito
        res.send({ message: "ok", data: data });
    } catch (e) {
        console.error("Error al crear el registro:", e);
        res.status(500).send({ error: e.message || "ERROR_CREATE_TYC_PARQUEO" });
    }
};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await TyCParqueoModels.update(
            {
                ultimo_vehiculo: body.ultimo_vehiculo,
            },
            {
                where: { usuario: body.usuario },
            }
        )
        res.status(200);
        res.send({ message: "ok" });
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_TYC_VEHICULO");
    }
};


const getUsuarioElectroHubByEmpresa = async (req, res) => {
    try {
        req = matchedData(req);
        const { idOrganizacion } = req;

        const empresa = await empresaModels.findOne({
            where: { emp_id: idOrganizacion },
            attributes: ['emp_nombre']
        });

        if (!empresa) {
            return res.status(404).send({ 
                message: "Organización no encontrada",
                data: [] 
            });
        }

        const nombreEmpresa = empresa.emp_nombre;

        const usuariosEmpresa = await usuarioModels.findAll({
            where: {
                usu_empresa: nombreEmpresa,
                [Op.or]: [
                    { usu_prueba: { [Op.notIn]: ['1', '-1', 1, -1] } },
                    { usu_prueba: null }
                ]
            },
            attributes: ['usu_documento', 'usu_nombre', 'usu_email', 'usu_telefono']
        });

        if (usuariosEmpresa.length === 0) {
            return res.send({ data: [] });
        }

        const documentosUsuarios = usuariosEmpresa.map(u => String(u.usu_documento));

        const usuariosParqueo = await TyCParqueoModels.findAll({
            where: {
                usuario: {
                    [Op.in]: documentosUsuarios
                }
            },
            attributes: [
                'usuario',
                'fecha_inscripcion', 
                'ultimo_vehiculo',
                'telefono',
                'email',
                'saldo',
                'estado'
            ]
        });

        // Obtener conteo de parqueos por usuario
        const parqueosCounts = await rentaParqueoModels.findAll({
            attributes: [
                'usuario',
                [sequelize.fn('COUNT', sequelize.col('id')), 'total_parqueos']
            ],
            where: {
                usuario: {
                    [Op.in]: documentosUsuarios
                }
            },
            group: ['usuario']
        });

        const usuariosConNombre = usuariosEmpresa.map(usuario => {
            const docStr = String(usuario.usu_documento);
            const usuarioParqueo = usuariosParqueo.find(p => String(p.usuario) === docStr);
            const parqueosCount = parqueosCounts.find(p => String(p.usuario) === docStr);
            
            return {
                ...(usuarioParqueo ? usuarioParqueo.dataValues : {}),
                usuario: docStr,
                documento: docStr,
                nombre_usuario: usuario.usu_nombre || 'Sin nombre',
                telefono: (usuarioParqueo && usuarioParqueo.telefono) ? usuarioParqueo.telefono : (usuario.usu_telefono || ''),
                email: (usuarioParqueo && usuarioParqueo.email) ? usuarioParqueo.email : (usuario.usu_email || ''),
                saldo: usuarioParqueo ? usuarioParqueo.saldo : 0,
                estado: usuarioParqueo ? usuarioParqueo.estado : 'inactivo',
                fecha_inscripcion: usuarioParqueo ? usuarioParqueo.fecha_inscripcion : null,
                total_parqueos: parqueosCount ? Number(parqueosCount.dataValues ? parqueosCount.dataValues.total_parqueos : parqueosCount.total_parqueos || 0) : 0
            };
        });

        res.send({ data: usuariosConNombre });
    } catch (error) {
        console.error('Error al obtener usuarios de ElectroHub:', error);
        httpError(res, "ERROR_GET_USUARIO_ELECTROHUB");
    }
};

// Endpoint para obtener vehículos del usuario
const getVehiculosUsuario = async (req, res) => {
    try {
        const { documento } = req.params;
        
        const vehiculos = await VpusuariosModels.findAll({
            where: { vus_usuario: documento },
            attributes: [
                'vus_id',
                'vus_tipo',
                'vus_marca',
                'vus_modelo',
                'vus_cilindraje',
                'vus_color',
                'vus_serial',
                'vus_fecha_registro',
                'vus_estado'
            ]
        });
        
        console.log('Vehículos encontrados:', vehiculos.length);
        res.send({ data: vehiculos });
    } catch (error) {
        console.error('Error al obtener vehículos:', error);
        httpError(res, "ERROR_GET_VEHICULOS_USUARIO");
    }
};

const getHistorialParqueosUsuario = async (req, res) => {
    try {
        const { documento } = req.params;
        
        const historial = await rentaParqueoModels.findAll({
            where: { usuario: documento },
            include: [{
                model: Lugar_parqueo,
                attributes: ['numero'],
                include: [{
                    model: Parqueaderos,
                    attributes: ['nombre']
                }]
            }],
            order: [['fecha', 'DESC']]
        });
        
        res.send({ data: historial });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        httpError(res, "ERROR_GET_HISTORIAL_USUARIO");
    }
};

const updateUsuarioElectroHub = async (req, res) => {
    try {
        const { usuario } = req.params;
        let { saldo, estado } = req.body;
        
        if (estado) {
            estado = estado.toString().trim().toLowerCase();
        }
        
        if (!usuario) {
            return res.status(400).send({ 
                message: "Usuario no proporcionado",
                success: false 
            });
        }

        if (saldo === undefined || saldo === null) {
            return res.status(400).send({ 
                message: "Saldo no proporcionado",
                success: false 
            });
        }

        if (!estado || !['activo', 'inactivo'].includes(estado)) {
            return res.status(400).send({ 
                message: "Estado debe ser 'activo' o 'inactivo'",
                success: false 
            });
        }

        const data = await TyCParqueoModels.update(
            { 
                saldo: saldo,
                estado: estado 
            },
            { where: { usuario: usuario } }
        );

        if (data[0] === 0) {
            return res.status(404).send({ 
                message: "Usuario no encontrado",
                success: false 
            });
        }

        res.send({ 
            message: "Usuario actualizado correctamente",
            success: true,
            saldo: saldo,
            estado: estado,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al actualizar usuario ElectroHub:', error);
        res.status(500).send({
            message: "Error interno del servidor",
            error: error.message,
            success: false
        });
    }
};


const updateItem_saldo = async (req, res) => {
    try {
        const { body } = req
        const data = await TyCParqueoModels.update(
            {
                saldo: body.saldo,
            },
            {
                where: { usuario: body.usuario },
            }
        )
        res.status(200);
        res.send({ message: "ok" });
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_TYC_HORA");
    }
};

const processMassiveUpdateSaldos = async (req, res) => {
    try {
        const { updates } = req.body;
        
        let successful = 0;
        let failed = 0;
        let noChanges = 0;
        const failedRecords = [];

        for (const update of updates) {
            try {
                const { documento, nuevoSaldo } = update;
                
                // Cambiar findByPk por findOne
                const usuarioActual = await TyCParqueoModels.findOne({
                    where: { usuario: documento }
                });
                
                if (!usuarioActual) {
                    failed++;
                    failedRecords.push({
                        documento,
                        error: 'Usuario no encontrado'
                    });
                    continue;
                }

                // Mejorar comparación de saldos
                const saldoActual = parseFloat(usuarioActual.saldo || 0);
                const saldoNuevo = parseFloat(nuevoSaldo || 0);
                
                if (saldoActual === saldoNuevo) {
                    noChanges++;
                    continue;
                }

                const result = await TyCParqueoModels.update(
                    { saldo: saldoNuevo },
                    { where: { usuario: documento } }
                );

                if (result[0] > 0) {
                    successful++;
                } else {
                    failed++;
                    failedRecords.push({
                        documento,
                        error: 'Error al actualizar'
                    });
                }
            } catch (error) {
                console.log('Error en update individual:', error); // Debug
                failed++;
                failedRecords.push({
                    documento: update.documento || 'N/A',
                    error: error.message || 'Error al procesar'
                });
            }
        }

        res.send({
            message: "Actualización masiva completada",
            successful,
            failed,
            noChanges,
            total: updates.length,
            failedRecords: failedRecords.slice(0, 10)
        });

    } catch (error) {
        console.error('Error en actualización masiva:', error);
        res.status(500).send({
            message: "Error en el servidor",
            error: error.message
        });
    }
};


const deleteItem = (req, res) => { };

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem, getUsuarioElectroHubByEmpresa, updateUsuarioElectroHub, updateItem_saldo, processMassiveUpdateSaldos, getHistorialParqueosUsuario, getVehiculosUsuario
}
