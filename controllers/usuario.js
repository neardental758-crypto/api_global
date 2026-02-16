const { matchedData } = require('express-validator');
const { usuarioModels, empresaModels, estacionModels } = require('../models');
const { registroextModels } = require('../models');
const Estacion = require('../models/mysql/estacion');
const Extendido = require('../models/mysql/registroext');
const Empresa = require('../models/mysql/empresa');
const Agendados = require('../models/mysql/agendamientoUsuario');
const { tokenSign, verifyToken, tokenSign_2 } = require('../utils/handleJwt')
const { encrypt, compare } = require('../utils/handlePassword')
const { httpError } = require('../utils/handleError');
const { sequelize } = require('../config/mysql');
const _id_cortezza = '627a8c9931feb31c33377d0e';
const UsuarioEmpresas = require('../models/mysql/usuarios_empresas');
const nodemailer = require("nodemailer");
const { Op } = require('sequelize');

const registroExtModels = require('../models/mysql/registroext');
const empresasModels = require('../models/mysql/empresa');
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
        include:[{
                model: Estacion,
                attributes: ['est_estacion', 'est_empresa', 'est_direccion'],
            },
            {
                model: Extendido,
                as: 'extendido'
            },{
                model: Agendados,
                as: 'Agenda',
                where : {
                    agendado_resultado : 'APROBADO'
                },
                required : false
            }
        ],
    });
    res.send({data, user});
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
        const data = await usuarioModels.findByPk(usu_documento);
        const dataRegisterExtended = await registroextModels.findByPk(usu_documento);
        res.send({ data, dataRegisterExtended });
    } catch (e) {
        httpError(res, `ERROR_GET_USER`)
    }
};

const createItem = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { body } = req;
        const registroExtData = {
            "idUser": body.usu_documento,
            "transporte_primario": body.transporte_primario,
            "tiempo_casa_trabajo": body.tiempo_casa_trabajo,
            "dias_trabajo": body.dias_trabajo,
            "satisfaccion_transporte": body.satisfaccion_transporte,
            "dinero_gastado_tranporte": body.dinero_gastado_tranporte,
            "alternativas": body.alternativas,
            "Estacion": body.nombreEstacion,
        };
        const dataExt = await registroextModels.create(registroExtData, { transaction });
        const data = await usuarioModels.create(body, { transaction });
        await transaction.commit();
        res.send('ok');
    } catch (error) {
        await transaction.rollback();
        console.error('Validation error details:', error.errors);
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
    const usuarioCreado = await usuarioModels.create({
      usu_documento: body.idNumber,
      usu_nombre: body.nombre,
      usu_empresa: empresa.emp_nombre, // Nombre exacto de la empresa
      usu_ciudad: "Dashboard",
      usu_habilitado: 1,
      usu_calificacion: 5,
      usu_viajes: 0,
      usu_edad: 0,
      usu_genero: 'No especificado',
      usu_dir_trabajo: 'dir trabajo',
      usu_dir_casa: 'No especificado',
      usu_recorrido: '0',
      usu_roles_carpooling: body.rol_dash,
      usu_rol_dash: body.rol_dash,
      usu_creacion: body.creacion || new Date().toISOString(),
      usu_prueba: "0",
      usu_modulo_carpooling: false
    }, { transaction });
    
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
                'usu_rol_dash','usu_ciudad','usu_empresa',
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
                where: { usu_documento : body.usu_documento },
            }
        )
        res.send({data})
    } catch (error) {
        httpError(res, "ERROR_UPDATE_USER");
    }
};
const patchItem = async (req, res) => {
    const usu_documento = req.params.usu_documento;
    const updates = req.body;

    try {
        const [affectedRows] = await usuarioModels.update(updates, {
            where: { usu_documento }
        });

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se realizaron cambios en el registro.'
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
            return res.status(404).json({ error: 'Usuario no encontrado o no actualizado' });
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
            
            whereClause.usu_creacion = {
                [Op.between]: [fechaInicio, fechaFin]
            };
        } else if (filterFechaDesde) {
            const fechaInicio = new Date(filterFechaDesde + 'T00:00:00');
            whereClause.usu_creacion = {
                [Op.gte]: fechaInicio
            };
        } else if (filterFechaHasta) {
            const fechaFin = new Date(filterFechaHasta + 'T23:59:59');
            whereClause.usu_creacion = {
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
                orderClause = [['usu_creacion', sortDirection.toUpperCase()]];
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
    const login = async (req, res) =>{
        try {
            req = matchedData(req)//limpiamos la data
            const user = await usuarioModels.findOne({email:req.email})
            .select('password email rol name');//filtramos el documento por el email
            if (!user) {
                //si no existe msn y se salga
                httpError(res, "USER_NOT_EXISTS", 404)
                return
            }
            //creamos variables con la contraseña del documento filtrado
            const hashPassword = user.get('password');
            //comparamos la contraseña que llegua desde el requerimiento con la filtrada del documento
            const check = await compare(req.password, hashPassword)
            if (!check) {
                httpError(res, "PASSWORD_INVALID", 401)
                return
            }
            //se crea una constante para construir la respuesta donde la password no se muestre
            user.set('password', undefined, {strict: false})
            const data = {
                token: await tokenSign(user),
                user
            }
            res.send({data})
        } catch (e) {
            httpError(res, "ERROR_LOGIN");
        }
    };

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await usuarioModels.deleteOne({_id:id});
        res.send({data});
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
        include:[
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
    res.send({data, user});
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

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem, login, patchItem, patchOrganization, generateTokenForOrganization,getItem_cortezza, getItems_cortezza,createUserComplete,getOperarios, checkUserExists, correo__password_ride, correo__password_meb, getUsersByOrganization
}
