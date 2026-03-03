const { matchedData } = require('express-validator');
const { usuarioModels, empresaModels, estacionModels } = require('../models');
const { registroextModels } = require('../models');
const Estacion = require('../models/mysql/estacion');
const Extendido = require('../models/mysql/registroext');
const Empresa = require('../models/mysql/empresa');
const Agendados = require('../models/mysql/agendamientoUsuario');
const UsuarioRol = require('../models/mysql/usuariosRoles');
const { tokenSign, verifyToken, tokenSign_2 } = require('../utils/handleJwt')
const { encrypt, compare } = require('../utils/handlePassword')
const { httpError } = require('../utils/handleError');
const { sequelize } = require('../config/mysql');
const { QueryTypes } = require('sequelize');
const _id_cortezza = '627a8c9931feb31c33377d0e';
const UsuarioEmpresas = require('../models/mysql/usuarios_empresas');
const nodemailer = require("nodemailer");
const { Op } = require('sequelize');
const { randomUUID } = require('crypto');

const registroExtModels = require('../models/mysql/registroext');
const empresasModels = require('../models/mysql/empresa');

const resolveEstacionDireccionOrThrow = async (direccion, transaction) => {
    if (typeof direccion !== "string") {
        throw new Error("USU_DIR_TRABAJO_REQUIRED");
    }
    const trimmed = direccion.trim();
    if (!trimmed) {
        throw new Error("USU_DIR_TRABAJO_REQUIRED");
    }

    const rows = await sequelize.query(
        "SELECT est_direccion FROM bc_estaciones WHERE est_direccion = ? LIMIT 1",
        {
            replacements: [trimmed],
            type: QueryTypes.SELECT,
            transaction: transaction,
        },
    );

    if (rows && rows[0] && rows[0].est_direccion) {
        return trimmed;
    }

    throw new Error("USU_DIR_TRABAJO_NOT_FOUND");
};
/**
 * funcion getItems donde se requiere el modelo de esta collecion
 * utilizamos try catch para manejo de errores
 * se requiere el userModel donde se estructura la lógica de la colleción
 * @param {*} req
 * @param {*} res
 */
const getItems = async (req, res) => {
    try {
        const user = req.user
        const data = await usuarioModels.findAll({
            include: [{
                model: Estacion,
                attributes: ['est_estacion', 'est_empresa', 'est_direccion'],
            },
            {
                model: Extendido,
                as: 'extendido'
            }, {
                model: Agendados,
                as: 'Agenda',
                where: {
                    agendado_resultado: 'APROBADO'
                },
                required: false
            }
            ],
        });
        res.send({ data, user });
    } catch (error) {
        httpError(res, `Error `);
    }
};
// const getItemsToDate = async (req, res) => {
//     try {
//         const user = req.user
//         const data = await usuarioModels.findAll({
//             where:{
//                 pre_retiro_fecha : pre_retiro_fecha,
//                 pre_devolucion_fecha : pre_devolucion_fecha
//             }
//         });
//         res.send({data, user});
//     } catch (error) {
//         httpError(res, "ERROR_GET_ITEM");
//     }
// };

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const { usu_documento } = req
        // Evitar errores por desalineación modelo/tabla (columnas inexistentes)
        // Consultamos únicamente las columnas necesarias para el dashboard.
        const rows = await sequelize.query(
            `SELECT 
                usu_documento,
                usu_nombre,
                usu_empresa,
                usu_ciudad,
                usu_rol_dash,
                usu_email,
                usu_fecha_nacimiento,
                usu_genero,
                usu_dir_trabajo,
                usu_img,
                usu_prueba,
                usu_habilitado
             FROM bc_usuarios
             WHERE usu_documento = :usu_documento
             LIMIT 1`,
            {
                replacements: { usu_documento },
                type: QueryTypes.SELECT,
            }
        );

        const data = Array.isArray(rows) && rows.length ? rows[0] : null;

        let dataRegisterExtended = null;
        try {
            dataRegisterExtended = await registroextModels.findByPk(usu_documento);
        } catch (err) {
            dataRegisterExtended = null;
        }

        res.send({ data, dataRegisterExtended });
    } catch (e) {
        console.error('ERROR_GET_USER getItem', { usu_documento: req?.usu_documento, error: e });
        httpError(res, `ERROR_GET_USER`)
    }
};

const createItem = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { body } = req;

        // Mapear campos del app móvil al formato MySQL si vienen con nombres del formulario
        const usu_documento = body.usu_documento || body.idNumber;
        const usu_nombre = body.usu_nombre || body.name;
        const usu_email = body.usu_email || body.email;
        const usu_password_raw = body.usu_password || body.password;
        const usu_telefono = body.usu_telefono || body.phoneNumber || 'Sin telefono';
        const usu_empresa = body.usu_empresa || body.empresaNombre || 'Sin empresa';
        const usu_ciudad = body.usu_ciudad || 'BOGOTA';
        const usu_tipo_documento = body.usu_tipo_documento || body.idType || 'Cedula de ciudadania';
        const usu_fecha_nacimiento = body.usu_fecha_nacimiento || body.birthday || new Date().toISOString();
        const usu_genero = body.usu_genero || body.gender || 'No especificado';
        const usu_dir_trabajo = body.usu_dir_trabajo || body.dirTrabajo || 'No especificado';
        const usu_dir_casa = body.usu_dir_casa || body.dirCasa || 'No especificado';
        const usu_recorrido = body.usu_recorrido || '0';
        const usu_img = body.usu_img || body.s3Route || 'Sin url';

        if (!usu_documento) {
            await transaction.rollback();
            return res.status(400).send('ERROR: usu_documento es requerido');
        }

        // 1. Encriptar contraseña
        let passwordHash = usu_password_raw;
        if (usu_password_raw) {
            passwordHash = await encrypt(usu_password_raw);
        }

        // 2. Preparar datos para bc_registro_ext (Tabla de datos extendidos)
        const registroExtData = {
            "idUser": usu_documento,
            "transporte_primario": body.transporte_primario || 'No especificado',
            "tiempo_casa_trabajo": body.tiempo_casa_trabajo || '0',
            "tiempo_trabajo_casa": body.tiempo_trabajo_casa || '0',
            "dias_trabajo": body.dias_trabajo || '5',
            "satisfaccion_transporte": body.satisfaccion_transporte || 3,
            "dinero_gastado_tranporte": body.dinero_gastado_tranporte || '0',
            "factor_principal_modo_transporte": body.factor_principal_modo_transporte || 'App',
            "alternativas": body.alternativas || 'Ninguna',
            "percepcion_movilizarce_bici": body.percepcion_movilizarce_bici || 'Neutral',
            "barreras_movilizarce_bici": body.barreras_movilizarce_bici || 'Ninguna',
            "beneficios_movilizarce_bici": body.beneficios_movilizarce_bici || 'Salud',
            "dias_semana_ejercicio": body.dias_semana_ejercicio || 0,
        };
        await registroextModels.create(registroExtData, { transaction });

        // 3. Preparar datos para bc_usuarios (Tabla principal)
        const userData = {
            usu_documento,
            usu_tipo_documento,
            usu_nombre,
            usu_email,
            usu_password: passwordHash,
            usu_telefono,
            usu_empresa,
            usu_ciudad,
            usu_fecha_nacimiento,
            usu_genero,
            usu_dir_trabajo,
            usu_dir_casa,
            usu_recorrido,
            usu_coor_casa: body.coorCasa || null,
            usu_coor_trabajo: body.coorTrabajo || null,
            usu_img: usu_img,
            usu_habilitado: body.usu_habilitado != null ? body.usu_habilitado : 0,
            usu_prueba: body.usu_prueba != null ? body.usu_prueba : 0,
            usu_created_at: new Date(),
            usu_updated_at: new Date(),
        };
        await usuarioModels.create(userData, { transaction });

        // 4. Crear rol de usuario en bc_usuarios_roles
        const rolData = {
            ur_id: randomUUID(),
            ur_usuario_id: usu_documento,
            ur_rol_id: body.ur_rol_id || '6142ca4bd97a767dbd8ad130',
            ur_created_at: new Date(),
            ur_updated_at: new Date(),
        };
        await UsuarioRol.create(rolData, { transaction });

        await transaction.commit();
        console.log('[REGISTRO] Usuario creado exitosamente en MySQL:', usu_documento);
        res.send('ok');
    } catch (error) {
        await transaction.rollback();
        console.error('Error detallado al crear usuario:', error);
        res.status(500).send(`ERROR_CREATE_ITEM: ${error.message}`);
    }
};

const createUserComplete = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const body = req.body;

        // 1. Verificar si tenemos el ID de la organización
        const organizacionId = body.organizacionId;
        if (!organizacionId) {
            await transaction.rollback();
            return res.status(400).send({
                error: "DATOS_INCOMPLETOS",
                message: "No se proporcionó ID de organización"
            });
        }

        // 2. Buscar la empresa por ID en el campo emp_id
        let empresa = await empresasModels.findOne({
            where: { emp_id: organizacionId },
            transaction
        });

        // Si no se encuentra, buscar la primera empresa como fallback
        if (!empresa) {
            console.log("No se encontró empresa con ID:", organizacionId);
            empresa = await empresasModels.findOne({ transaction });

            if (!empresa) {
                await transaction.rollback();
                return res.status(404).send({
                    error: "EMPRESA_NO_ENCONTRADA",
                    message: "No se pudo encontrar una empresa para asociar al usuario"
                });
            }
        }

        // 3. Verificar si el usuario ya existe
        const usuarioExistente = await usuarioModels.findByPk(body.idNumber, { transaction });
        if (usuarioExistente) {
            await transaction.rollback();
            return res.status(409).send({
                error: "USUARIO_YA_EXISTE",
                message: "El usuario con este documento ya existe en la base de datos"
            });
        }

        // 3.1 Verificar si el correo ya existe
        const emailToCheck = body && body.email ? String(body.email).trim() : "";
        if (emailToCheck) {
            const rowsEmail = await sequelize.query(
                "SELECT usu_documento FROM bc_usuarios WHERE usu_email = ? LIMIT 1",
                {
                    replacements: [emailToCheck],
                    type: QueryTypes.SELECT,
                    transaction: transaction,
                },
            );
            if (rowsEmail && rowsEmail[0] && rowsEmail[0].usu_documento) {
                await transaction.rollback();
                return res.status(409).send({
                    error: "EMAIL_YA_EXISTE",
                    message: "El correo ya está registrado en el sistema",
                });
            }
        }

        // 4. Crear primero el registro extendido (para satisfacer la clave foránea)
        await registroExtModels.create({
            idUser: body.idNumber,
            transporte_primario: 'No especificado',
            tiempo_casa_trabajo: '0',
            tiempo_trabajo_casa: '0',
            dias_trabajo: '5',
            satisfaccion_transporte: 3,
            dinero_gastado_tranporte: '0',
            factor_principal_modo_transporte: 'Dashboard',
            alternativas: 'Dashboard',
            percepcion_movilizarce_bici: 'Positiva',
            barreras_movilizarce_bici: 'Ninguna',
            beneficios_movilizarce_bici: 'Salud',
            dias_semana_ejercicio: 0
        }, { transaction });

        // 5. Crear el usuario con el nombre de empresa correcto
        const nombre = body && body.nombre ? String(body.nombre) : "";
        const apellido = body && body.apellido ? String(body.apellido) : "";
        const fullName = (nombre + " " + apellido).trim();
        const email = body && body.email ? String(body.email) : "";
        const birthdate = body && body.birthdate ? String(body.birthdate) : "";
        const genero = body && body.genero ? String(body.genero) : "";
        const usuImg = body && body.usu_img ? String(body.usu_img) : "";
        const usuPrueba = body && typeof body.usu_prueba !== "undefined" ? body.usu_prueba : 0;
        const habilitado = body && typeof body.usu_habilitado !== "undefined"
            ? Number(body.usu_habilitado) === 1
                ? 1
                : 0
            : body && body.accountState
                ? String(body.accountState) === "active"
                    ? 1
                    : 0
                : 1;
        const cargo = body && body.position ? String(body.position) : "";
        let cargoDireccionValida = null;
        try {
            cargoDireccionValida = await resolveEstacionDireccionOrThrow(cargo, transaction);
        } catch (e) {
            await transaction.rollback();
            return res.status(400).send({
                error: "USU_DIR_TRABAJO_INVALID",
                message:
                    "La dirección de trabajo debe existir en bc_estaciones.est_direccion.",
            });
        }

        const usuarioCreado = await usuarioModels.create({
            usu_documento: body.idNumber,
            usu_nombre: fullName || body.nombre,
            usu_email: email,
            usu_empresa: empresa.emp_nombre, // Nombre exacto de la empresa
            usu_ciudad: "Dashboard",
            usu_habilitado: habilitado,
            usu_calificacion: 5,
            usu_viajes: 0,
            usu_edad: 0,
            usu_genero: genero || 'No especificado',
            usu_fecha_nacimiento: birthdate,
            usu_img: usuImg,
            usu_dir_trabajo: cargoDireccionValida,
            usu_dir_casa: 'No especificado',
            usu_recorrido: '0',
            usu_roles_carpooling: body.rol_dash,
            usu_rol_dash: body.rol_dash,
            usu_created_at: body.creacion || new Date().toISOString(),
            usu_prueba: Number(usuPrueba) === 1 ? 1 : 0,
            usu_modulo_carpooling: false
        }, { transaction });

        // 5.1 Crear relación usuario-rol si viene rolId
        const rolId = body && (body.rolId || body.ur_rol_id) ? (body.rolId || body.ur_rol_id) : null;
        if (rolId) {
            const urId = "ur-" + String(body.idNumber) + "-" + String(rolId);
            const existingUr = await UsuarioRol.findByPk(urId, { transaction });
            if (!existingUr) {
                await UsuarioRol.create(
                    {
                        ur_id: urId,
                        ur_usuario_id: String(body.idNumber),
                        ur_rol_id: String(rolId),
                        ur_created_at: new Date(),
                        ur_updated_at: new Date(),
                    },
                    { transaction },
                );
            }
        }

        // 6. Confirmar la transacción
        await transaction.commit();

        res.status(201).send({
            data: usuarioCreado,
            message: "Usuario creado con éxito",
            empresa: empresa.emp_nombre
        });

    } catch (error) {
        // Revertir transacción en caso de error
        await transaction.rollback();

        res.status(500).send({
            error: "ERROR_CREAR_USUARIO",
            message: "Error al crear el usuario completo en MySQL",
            details: error.message,
            errorType: error.name
        });
    }
};

const checkUserExists = async (req, res) => {
    try {
        const { idNumber } = req.params;

        if (!idNumber) {
            return res.status(400).send({
                error: "DATOS_INCOMPLETOS",
                message: "No se proporcionó número de identificación"
            });
        }

        const usuarioExistente = await usuarioModels.findByPk(idNumber);

        res.status(200).send({
            exists: !!usuarioExistente,
            message: usuarioExistente ? "El usuario ya existe" : "Usuario no encontrado"
        });

    } catch (error) {
        console.error("Error al verificar usuario:", error);
        res.status(500).send({
            error: "ERROR_VERIFICAR_USUARIO",
            message: "Error al verificar si el usuario existe",
            details: error.message
        });
    }
};

const getOperarios = async (req, res) => {
    try {
        const data = await usuarioModels.findAll({
            attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_ciudad', 'usu_dir_trabajo',
                'usu_rol_dash', 'usu_ciudad', 'usu_empresa',
            ],
            where: {
                // Aquí puedes agregar condiciones para filtrar solo operarios si hay algún campo que los identifique
                usu_rol_dash: "Operario"
            }
        });

        const filteredData = data.filter(operario =>
            operario.usu_nombre &&
            operario.usu_nombre.trim() !== '' &&
            operario.usu_nombre !== 'Desconocido'
        );

        res.send({ data: filteredData });

    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_GET_OPERARIOS");
    }
};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await usuarioModels.update(
            {
                usu_nombres: body.Nombre,
                usu_apellidos: body.Apellido,
                usu_telefono2: body.Tel2,
                usu_eps: body.EPS,
                usu_rh: body.RH,
            },
            {
                where: { usu_documento: body.usu_documento },
            }
        )
        res.send({ data })
    } catch (error) {
        httpError(res, "ERROR_UPDATE_USER");
    }
};
const patchItem = async (req, res) => {
    const usu_documento = req.params.usu_documento;
    const updates = req.body;

    try {
        if (updates && Object.prototype.hasOwnProperty.call(updates, "password") && !Object.prototype.hasOwnProperty.call(updates, "usu_password")) {
            updates.usu_password = updates.password;
            delete updates.password;
        }

        if (updates && Object.prototype.hasOwnProperty.call(updates, "usu_password")) {
            const rawPwd = updates.usu_password;
            if (typeof rawPwd !== "string" || !rawPwd.trim()) {
                return res.status(400).json({
                    success: false,
                    error: "USU_PASSWORD_REQUIRED",
                    message: "La contraseña es requerida.",
                });
            }
            updates.usu_password = await encrypt(String(rawPwd));
            updates.usu_updated_at = new Date();
        }

        if (updates && Object.prototype.hasOwnProperty.call(updates, "usu_dir_trabajo")) {
            try {
                updates.usu_dir_trabajo = await resolveEstacionDireccionOrThrow(updates.usu_dir_trabajo);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    error: "USU_DIR_TRABAJO_INVALID",
                    message:
                        "La dirección de trabajo debe existir en bc_estaciones.est_direccion.",
                });
            }
        }

        const [affectedRows] = await usuarioModels.update(updates, {
            where: { usu_documento }
        });

        if (affectedRows === 0) {
            return res.status(200).json({
                success: true,
                message: 'Sin cambios (usuario ya estaba actualizado).',
                affectedRows
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Actualización exitosa.',
            affectedRows
        });
    } catch (error) {
        console.error('PATCH ENDPOINT - Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el usuario.'
        });
    }
};


const patchOrganization = async (req, res) => {
    const objetoACambiar = req.body.nuevaEmpresa;
    const usu_documento = req.params.usu_documento;
    try {
        const nombreEmpresa = await empresaModels.findOne({
            where: {
                emp_id: objetoACambiar
            }
        });
        if (!nombreEmpresa) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }
        const data = await usuarioModels.update(
            {
                usu_empresa: nombreEmpresa.emp_nombre
            },
            {
                where: { usu_documento: usu_documento }
            }
        );
        if (data[0] === 0) {
            return res.status(200).json({ message: 'Sin cambios (empresa ya actualizada).', data });
        }
        res.json({ message: 'Usuario actualizado correctamente', data });
    } catch (error) {
        console.error(error);
        httpError(res, `ERROR_UPDATE_USER`);
    }
};



const getUsersByOrganization = async (req, res) => {
    try {
        const { emp_nombre } = req.params;
        const user = req.user;

        let params = {};
        if (req.query.filter) {
            params = JSON.parse(req.query.filter);
        } else {
            params = req.query;
        }

        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 20;
        const search = params.search || "";
        const filterEstado = params.filterEstado || "";
        const filterFechaDesde = params.filterFechaDesde || "";
        const filterFechaHasta = params.filterFechaHasta || "";
        const filterEstacion = params.filterEstacion || "";
        const roleId = params.roleId || "";
        const sortColumn = params.sortColumn || "";
        const sortDirection = params.sortDirection || "asc";

        const offset = (page - 1) * limit;

        let whereClause = { usu_empresa: emp_nombre };

        if (search) {
            whereClause = {
                ...whereClause,
                [Op.or]: [
                    { usu_nombre: { [Op.like]: `%${search}%` } },
                    { usu_documento: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        if (filterEstado !== "") {
            whereClause.usu_habilitado = parseInt(filterEstado);
        }

        if (filterFechaDesde && filterFechaHasta) {
            const fechaInicio = new Date(filterFechaDesde + 'T00:00:00');
            const fechaFin = new Date(filterFechaHasta + 'T23:59:59');

            whereClause.usu_created_at = {
                [Op.between]: [fechaInicio, fechaFin]
            };
        } else if (filterFechaDesde) {
            const fechaInicio = new Date(filterFechaDesde + 'T00:00:00');
            whereClause.usu_created_at = {
                [Op.gte]: fechaInicio
            };
        } else if (filterFechaHasta) {
            const fechaFin = new Date(filterFechaHasta + 'T23:59:59');
            whereClause.usu_created_at = {
                [Op.lte]: fechaFin
            };
        }

        let includeClause = [
            {
                model: Estacion,
                as: 'bc_estacione',
                attributes: ['est_estacion', 'est_empresa', 'est_direccion'],
            },
            {
                model: Extendido,
                as: 'extendido'
            },
            {
                model: Agendados,
                as: 'Agenda',
                where: { agendado_resultado: 'APROBADO' },
                required: false
            }
        ];

        if (roleId) {
            includeClause.push({
                model: UsuarioRol,
                attributes: [],
                where: { ur_rol_id: String(roleId) },
                required: true,
            });
        }

        if (filterEstacion) {
            includeClause[0].where = { est_estacion: filterEstacion };
            includeClause[0].required = true;
        }

        let orderClause = [['usu_documento', 'ASC']];
        if (sortColumn) {
            if (sortColumn === 'userStation') {
                orderClause = [[{ model: Estacion, as: 'bc_estacione' }, 'est_estacion', sortDirection.toUpperCase()]];
            } else if (sortColumn === 'name') {
                orderClause = [['usu_nombre', sortDirection.toUpperCase()]];
            } else if (sortColumn === 'idNumber') {
                orderClause = [['usu_documento', sortDirection.toUpperCase()]];
            } else if (sortColumn === 'usu_habilitado' || sortColumn === 'accountState' || sortColumn === 'accountState3G4G') {
                orderClause = [['usu_habilitado', sortDirection.toUpperCase()]];
            } else if (sortColumn === 'created_at') {
                orderClause = [['usu_created_at', sortDirection.toUpperCase()]];
            }
        }

        const countPromise = usuarioModels.count({
            where: whereClause,
            include: includeClause.map(inc => ({ ...inc, attributes: [] })),
            distinct: true
        });

        const rowsPromise = usuarioModels.findAll({
            where: whereClause,
            include: includeClause,
            limit: limit,
            offset: offset,
            order: orderClause,
            subQuery: false
        });

        const [count, rows] = await Promise.all([countPromise, rowsPromise]);


        const allEstaciones = await Estacion.findAll({
            attributes: ['est_estacion'],
            where: { est_empresa: emp_nombre },
            group: ['est_estacion']
        });

        res.send({
            data: rows,
            total: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit),
            estaciones: allEstaciones.map(e => e.est_estacion),
            user
        });
    } catch (error) {
        console.error('========== ERROR GET USERS ==========');
        console.error('ERROR:', error.message);
        httpError(res, `Error al obtener usuarios por organización: ${error.message}`);
    }
};
const login = async (req, res) => {
    try {
        const body = matchedData(req);
        const identifier = body && (body.user || body.email || body.usu_documento)
            ? String(body.user || body.email || body.usu_documento).trim()
            : "";
        const password = body && body.password ? String(body.password) : "";

        if (!identifier || !password) {
            return res.status(400).send({ error: "DATOS_INCOMPLETOS" });
        }

        const where = identifier.includes("@")
            ? { usu_email: identifier }
            : { usu_documento: identifier };

        const userRow = await usuarioModels.findOne({ where });

        if (!userRow) {
            return res.status(404).send({ error: "USER_NOT_EXISTS" });
        }

        const hashPassword = userRow.get("usu_password");
        if (!hashPassword) {
            return res.status(401).send({ error: "PASSWORD_INVALID" });
        }

        const ok = await compare(password, String(hashPassword));
        if (!ok) {
            return res.status(401).send({ error: "PASSWORD_INVALID" });
        }

        const userId = String(userRow.get("usu_documento"));
        const token = await tokenSign_2({
            role: "admin",
            permissions: ["all"],
            userId: userId,
        });

        return res.send({ token, id_user: userId });
    } catch (e) {
        console.error("ERROR_LOGIN bc_usuarios:", e);
        return httpError(res, "ERROR_LOGIN", 500);
    }
};

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await usuarioModels.deleteOne({ _id: id });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_DELETE_USER")
    }
};

const user_cortezza = {
    _id: "cortezza_mdn@gmail.com_5236425145_627a8c9931feb31c33377d0e",
    role: "external"
};

const generateTokenForOrganization = async () => {
    const token = await tokenSign_2(user_cortezza);
    console.log("Token para la organización de cortezza:", token);
};

//cortezza

const getItem_cortezza = async (req, res) => {
    try {
        req = matchedData(req);
        const { usu_documento } = req;

        // Buscar el usuario con relación a Empresa filtrada por emp_id
        const data = await usuarioModels.findByPk(usu_documento, {
            include: {
                model: Empresa,
                attributes: ['emp_id'],
                where: { emp_id: _id_cortezza }, // Filtro por emp_id
            },
        });

        // Validar si el usuario existe y está relacionado con la empresa
        if (!data) {
            return res.status(404).send({ error: 'Usuario no encontrado o no pertenece a la empresa cortezza' });
        }

        // Buscar el registro extendido del usuario
        const dataRegisterExtended = await registroextModels.findByPk(usu_documento);

        // Responder con los datos
        res.send({ data, dataRegisterExtended });
    } catch (e) {
        console.error(e); // Log para depuración
        httpError(res, 'ERROR_GET_USER');
    }
};


const getItems_cortezza = async (req, res) => {
    try {
        const user = req.user
        const data = await usuarioModels.findAll({
            include: [
                {
                    model: Estacion,
                    attributes: ['est_estacion', 'est_empresa', 'est_direccion'],
                },
                {
                    model: Extendido,
                    as: 'extendido'
                },
                {
                    model: Empresa,
                    attributes: ['emp_id'],
                    where: { emp_id: _id_cortezza }, // Filtrar por emp_id
                },
            ],
        });
        res.send({ data, user });
    } catch (error) {
        httpError(res, `Error `);
    }
};

// 🔹 controlador resetPassword
const MAIL_USER = 'Servicio@bicyclecapital.co'; // tu correo en .env
const MAIL_PASS = 'fyam ecci wqby fhaj';


const correo__password_ride = async (req, res) => {
    console.log('ENTRANDO A enviar correo desde la api')
    try {
        const { email, password } = req.body; // viene del frontend

        // configurar transporte SMTP con Gmail
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: MAIL_USER, // tu correo en .env
                pass: MAIL_PASS, // tu clave de aplicación Gmail
            },
        });

        // enviar correo al usuario
        await transporter.sendMail({
            from: `"Soporte RIDE" <${MAIL_USER}>`,
            to: email,
            subject: "Recuperación de contraseña",
            html: `
        <p>Hola,</p>
        <p>Tu nueva contraseña es: <strong>${password}</strong></p>
      `,
        });

        return res.json({ message: "Contraseña temporal enviada al correo." });
    } catch (error) {
        console.error("Error en correo__password:", error);
        return res.status(500).json({ error: "Error al enviar correo" });
    }
};

// 🔹 controlador resetPassword
const MAIL_USER_MEB = 'experiencia@mejorenbici.com'; // tu correo en .env
const MAIL_PASS_MEB = 'udtl ydrk pvyf oiev';


const correo__password_meb = async (req, res) => {
    console.log('ENTRANDO A enviar correo desde la api')
    try {
        const { email, password } = req.body; // viene del frontend

        // configurar transporte SMTP con Gmail
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: MAIL_USER_MEB, // tu correo en .env
                pass: MAIL_PASS_MEB, // tu clave de aplicación Gmail
            },
        });

        // enviar correo al usuario
        await transporter.sendMail({
            from: `"Soporte MEB" <${MAIL_USER_MEB}>`,
            to: email,
            subject: "Recuperación de contraseña",
            html: `
        <p>Hola,</p>
        <p>Tu nueva contraseña es: <strong>${password}</strong></p>
      `,
        });

        return res.json({ message: "Contraseña temporal enviada al correo." });
    } catch (error) {
        console.error("Error en correo__password:", error);
        return res.status(500).json({ error: "Error al enviar correo" });
    }
};

/**
 * Login para la app móvil - Endpoint público (sin authMiddleware)
 * Autentica contra bc_usuarios en MySQL y retorna JWT + datos del usuario
 */
const loginApp = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Buscar usuario por email en MySQL
        const user = await usuarioModels.findOne({
            where: { usu_email: email.toLowerCase() }
        });

        if (!user) {
            return res.status(404).json({ error: 'USER_NOT_EXISTS', message: 'El usuario no existe' });
        }

        // Comparar contraseña con bcrypt
        const isPasswordValid = await compare(password, user.usu_password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'PASSWORD_INVALID', message: 'Contraseña inválida' });
        }

        // Buscar roles del usuario
        const userRoles = await UsuarioRol.findAll({
            where: { ur_usuario_id: user.usu_documento }
        });

        // Generar JWT con permisos
        const jsonwebtoken = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET;
        const token = jsonwebtoken.sign(
            {
                usu_documento: user.usu_documento,
                usu_email: user.usu_email,
                permissions: 'all'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Buscar datos de la empresa
        let empresaData = null;
        if (user.usu_empresa) {
            empresaData = await empresasModels.findOne({
                where: { emp_nombre: user.usu_empresa }
            });
        }

        // Construir respuesta con datos del usuario (sin password)
        // Incluye alias compatibles con el formato anterior de MongoDB
        const userData = {
            id: user.usu_documento,
            usu_documento: user.usu_documento,
            usu_nombre: user.usu_nombre,
            usu_email: user.usu_email,
            usu_telefono: user.usu_telefono,
            usu_empresa: user.usu_empresa,
            usu_ciudad: user.usu_ciudad,
            usu_genero: user.usu_genero,
            usu_dir_trabajo: user.usu_dir_trabajo,
            usu_dir_casa: user.usu_dir_casa,
            usu_img: user.usu_img,
            usu_habilitado: user.usu_habilitado,
            organizationId: empresaData ? empresaData.emp_id : null,
            organizationName: user.usu_empresa,
            roles: userRoles.map(r => r.ur_rol_id),
            // Alias compatibles con el formato MongoDB anterior
            email: user.usu_email,
            name: user.usu_nombre,
            idNumber: user.usu_documento,
            documents: user.usu_img,
            phone: user.usu_telefono,
        };

        res.status(200).json({
            token,
            user: userData
        });

    } catch (e) {
        console.error('Error en loginApp:', e);
        httpError(res, 'ERROR_LOGIN', 500);
    }
};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem, login, loginApp, patchItem, patchOrganization, generateTokenForOrganization, getItem_cortezza, getItems_cortezza, createUserComplete, getOperarios, checkUserExists, correo__password_ride, correo__password_meb, getUsersByOrganization
}
