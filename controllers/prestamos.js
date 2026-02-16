const { matchedData } = require('express-validator');
const { prestamosModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const Estacion = require('../models/mysql/estacion');
const Empresa = require('../models/mysql/empresa');
const Bicicleta = require('../models/mysql/bicicletas');
const Bicicletero = require('../models/mysql/bicicleteros');
const { httpError } = require('../utils/handleError');
const { Op, literal } = require('sequelize');
const Comentarios = require('../models/mysql/comentarios');
const _id_cortezza = '627a8c9931feb31c33377d0e';
const nombre_cortezza = 'Cortezza MDN';
const Historiales = require('../models/mysql/historiales');
const { sequelize } = require("../config/mysql");



const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await prestamosModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_PRESTAMOS");
    }
};

const getItemsToDate = async (req, res) => {
        try {
        const filtro = JSON.parse(req.query.filter);
        const startedDate = new Date(filtro.startDate);
        const endDate = new Date(filtro.endDate);
        const data = await prestamosModels.findAll({
            where : {"pre_retiro_fecha" : {[Op.between] : [startedDate , endDate ]}},
            include:[{
                model: Usuario,
                include:[{
                    model: Empresa
                 }]
             }]
        });
        res.send({data});
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM `);
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {pre_id} = req
        const data = await prestamosModels.findByPk(pre_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_USER")
    }
};

const getItemUsuario = async (req, res) => {
    try {
        req = matchedData(req)
        const { PRESTAMO_USUARIO } = req
        const data = await prestamosModels.findAll({ where: { PRESTAMO_USUARIO: PRESTAMO_USUARIO }});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PRESTAMOS_USUARIO")
    }
};

const getItemPrestamoActivo = async (req, res) => {
    try {
        req = matchedData(req)
        const { pre_usuario } = req
        const data = await prestamosModels.findAll({
            where:  {
                        pre_usuario: pre_usuario,
                        pre_estado: 'ACTIVA'
                    }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PRESTAMOS_USUARIO")
    }
};

const getItemPrestamoActivoPP = async (req, res) => {
    try {
        req = matchedData(req)
        const { pre_usuario } = req
        const data = await prestamosModels.findAll({
            where:  {
                        pre_usuario: pre_usuario,
                        pre_estado: 'PRESTAMO PERSONALIZADO'
                    }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PRESTAMOS_USUARIO")
    }
};

const getItemAllPrestamoActivos = async (req, res) => {
  try {
      const data = await prestamosModels.findAll({
          include:[{
              model: Bicicleta,
              attributes: ['bic_numero'],
            },
            {
              model: Usuario,
              include:[{
                  model: Empresa
               }],
               where: {
                  usu_prueba: 0  // Añadir esta condición
               }
           }],
          where:  {
              pre_estado: 'ACTIVA'
          },
          order: [
              ['pre_id', 'DESC']
          ]
      });
      res.send({data});
  } catch (e) {
      httpError(res, `Error prestamos activos ${e}`)
  }
};

const getItemAllPrestamoFinalizados = async (req, res) => {
  try {
      const data = await prestamosModels.findAll({
          include:[{
              model: Bicicleta,
              attributes: ['bic_numero'],
            },
            {
              model: Usuario,
              include:[{
                  model: Empresa,
                }],
              where: {
                  usu_prueba: 0  // Añadir esta condición
              }
            },
          ],
          where:
          {
              pre_estado: 'FINALIZADA'
          },
          order: [
              ['pre_id', 'DESC']
          ]
      });
      res.send({data});
  } catch (e) {
      httpError(res, `Error prestamos finalizados ${e}` )
  }
};

const getItemAllPrestamoFinalizados3g = async (req, res) => {
  let { startDate, endDate } = req.query;
  req = matchedData(req);
  const { organizationId } = req;
  
  try {
    const data = await prestamosModels.findAll({
      include:[{
        model: Bicicleta,
        attributes: ['bic_nombre', 'bic_numero'],
        include:[{
          model: Estacion,
          attributes: ['est_mac'],
          where: {
            est_mac: 'sin mac'
          },
          include:[{
            model: Empresa,
            attributes: ['emp_id', 'emp_nombre'],
            where: {
              'emp_id': organizationId
            }
          }],
          required: true,
        }],
        required: true
      },
      {
        model: Comentarios,
        attributes: ['com_id', 'com_usuario', 'com_prestamo', 'com_fecha', 'com_comentario', 'com_estado', 'com_calificacion'],
      },
      {
        model: Usuario,
        attributes: ['usu_calificacion', 'usu_ciudad', 'usu_recorrido', 'usu_empresa', 'usu_nombre', 'usu_documento'],
        where: {
          usu_prueba: 0
        }
      }],
      where: {
        pre_estado: {
          [Op.ne]: 'CANCELADA'
        }
      },
      order: [
        ['pre_id', 'DESC']
      ]
    });
    
    let filteredData = data;
    
    if (startDate && endDate) {
      const cleanStartDate = String(startDate).split('?')[0].trim();
      const cleanEndDate = String(endDate).split('?')[0].trim();
      
      filteredData = data.filter(record => {
        const estado = record.pre_estado || '';
        const estadosActivos = ['ACTIVA', 'PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA'];
        
        let retiroDateStr = null;
        let devolucionDateStr = null;
        
        if (record.pre_retiro_fecha) {
          const fecha = new Date(record.pre_retiro_fecha);
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          retiroDateStr = `${year}-${month}-${day}`;
        }
        
        if (record.pre_devolucion_fecha) {
          const fecha = new Date(record.pre_devolucion_fecha);
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          devolucionDateStr = `${year}-${month}-${day}`;
        }
        
        if (estadosActivos.includes(estado)) {
          const shouldInclude = retiroDateStr ? retiroDateStr <= cleanEndDate : true;
          
          return shouldInclude;
        }
        
        const retiroInRange = retiroDateStr && 
          retiroDateStr >= cleanStartDate && retiroDateStr <= cleanEndDate;
        const devolucionInRange = devolucionDateStr && 
          devolucionDateStr >= cleanStartDate && devolucionDateStr <= cleanEndDate;
        
        return retiroInRange || devolucionInRange;
      });
      
    }
    
    res.send({data: filteredData});
  } catch (e) {
    console.error('[5] 3G Error:', e.message);
    httpError(res, `Error prestamos finalizados ${e}`)
  }
};

const getItemAllPrestamoFinalizados4g = async (req, res) => {
  let { startDate, endDate } = req.query;
  req = matchedData(req);
  const { organizationId } = req;
  
  try {
    const data = await prestamosModels.findAll({
      include:[{
        model: Bicicleta,
        attributes: ['bic_nombre', 'bic_numero'],
        include:[{
          model: Estacion,
          attributes: ['est_mac'],
          where: {
            est_mac: {
              [Op.ne]: 'sin mac'
            }
          },
          include:[{
            model: Empresa,
            attributes: ['emp_id', 'emp_nombre'],
            where: {
              'emp_id': organizationId
            }
          }],
          required: true,
        }],
        required: true
      },
      {
        model: Comentarios,
        attributes: ['com_id', 'com_usuario', 'com_prestamo', 'com_fecha', 'com_comentario', 'com_estado', 'com_calificacion'],
      },
      {
        model: Usuario,
        attributes: ['usu_calificacion', 'usu_ciudad', 'usu_recorrido', 'usu_empresa', 'usu_nombre', 'usu_documento'],
        where: {
          usu_prueba: 0
        }
      }],
      order: [
        ['pre_id', 'DESC']
      ]
    });
    
    let filteredData = data;
    
    if (startDate && endDate) {
      const cleanStartDate = String(startDate).split('?')[0].trim();
      const cleanEndDate = String(endDate).split('?')[0].trim();
      
      filteredData = data.filter(record => {
        const estado = record.pre_estado || '';
        const estadosActivos = ['ACTIVA', 'PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA'];
        
        let retiroDateStr = null;
        let devolucionDateStr = null;
        
        if (record.pre_retiro_fecha) {
          const fecha = new Date(record.pre_retiro_fecha);
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          retiroDateStr = `${year}-${month}-${day}`;
        }
        
        if (record.pre_devolucion_fecha) {
          const fecha = new Date(record.pre_devolucion_fecha);
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          devolucionDateStr = `${year}-${month}-${day}`;
        }
        
        if (estadosActivos.includes(estado)) {
          const shouldInclude = retiroDateStr ? retiroDateStr <= cleanEndDate : true;
          return shouldInclude;
        }
        
        const retiroInRange = retiroDateStr && 
          retiroDateStr >= cleanStartDate && retiroDateStr <= cleanEndDate;
        const devolucionInRange = devolucionDateStr && 
          devolucionDateStr >= cleanStartDate && devolucionDateStr <= cleanEndDate;
        
        return retiroInRange || devolucionInRange;
      });
      
    }
    
    res.send({data: filteredData});
  } catch (e) {
    console.error('[5] Error:', e.message);
    httpError(res, `Error prestamos finalizados ${e}`)
  }
};
const getItemPrestamosUsuario = async (req, res) => {
    try {
        req = matchedData(req)
        const { pre_usuario } = req
        const data = await prestamosModels.findAll({
            include:[
                {
                    model: Bicicleta,
                    attributes: [
                        'bic_id', 
                        'bic_nombre', 
                        'bic_numero', 
                        'bic_estacion', 
                        'bic_estado', 
                        'bic_descripcion',
                    ],
                },
                {
                    model: Bicicletero,
                    attributes: [
                        'bro_id',
                        'bro_nombre',  
                        'bro_estacion',  
                        'bro_numero',  
                        'bro_bicicleta', 
                        'bro_bluetooth',  
                        'bro_clave'
                    ],
                }
            ],
            where: {pre_usuario: pre_usuario}
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PRESTAMOS_USUARIO_VIAJESSS")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req;
        
        const existingActiveLoan = await prestamosModels.findOne({
            where: {
                pre_usuario: body.pre_usuario,
                pre_estado: 'ACTIVA'
            }
        });

        if (existingActiveLoan) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya tiene un préstamo activo',
                hasActiveLoan: true
            });
        }
        
        if (body.pre_dispositivo === 'web_pp' || body.pre_dispositivo === 'web_pe') {
            if (body.pre_retiro_fecha) {
                const fechaOriginal = new Date(body.pre_retiro_fecha);
                fechaOriginal.setHours(fechaOriginal.getHours() - 5);
                body.pre_retiro_fecha = fechaOriginal.toISOString();
            }
            
            if (body.pre_devolucion_fecha) {
                const fechaDevolucion = new Date(body.pre_devolucion_fecha);
                fechaDevolucion.setHours(fechaDevolucion.getHours() - 5);
                body.pre_devolucion_fecha = fechaDevolucion.toISOString();
            }
            
            if (body.pre_devolucion_hora && body.pre_devolucion_hora.includes('-')) {
                const fechaHora = new Date(body.pre_devolucion_hora);
                body.pre_devolucion_hora = fechaHora.toTimeString().slice(0, 8);
            }
        }
        
        const data = await prestamosModels.create(body);
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error al crear préstamo: ${error.message}`,
            error: error
        });
    }
};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await prestamosModels.update(
            {
                pre_estado: body.estado,
            },
            {
                where: { pre_id : body.pre_id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_PRESTAMO");
    }
};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const pre_id = req.params.pre_id;
    
    if (objetoACambiar.pre_devolucion_fecha) {
        const fechaOriginal = new Date(objetoACambiar.pre_devolucion_fecha);
        fechaOriginal.setHours(fechaOriginal.getHours() - 5);
        objetoACambiar.pre_devolucion_fecha = fechaOriginal.toISOString();
    }
    
    try {
        const data = await prestamosModels.update(
        objetoACambiar,
        {
            where: { pre_id: pre_id }
        })
        res.send('ok');
    } catch (error) {
        httpError(res, `ERROR_UPDATE_ESTADO_PRESTAMO `);
    }
};

const getItemByBicicleta = async (req, res) => {
    try {
        const bic_id = req.params.bic_id;
        const data = await prestamosModels.findOne({
            where: {
                pre_bicicleta: bic_id,
                // pre_estado: 'PRESTAMO PERSONALIZADO'
            },
            order: [['pre_id', 'DESC']]
        });
        
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró préstamo activo para esta bicicleta'
            });
        }

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error("Error al buscar préstamo por bicicleta:", error);
        res.status(500).json({
            success: false,
            message: `Error al buscar préstamo: ${error.message}`
        });
    }
};

const deleteItem = (req, res) => {};

/**
 * Obtiene todos los préstamos con información completa de bicicleta y usuario
 * para ser usados en los reportes
 */
// En el controlador prestamos.js


// Función 1: Reporte general con filtro por fechas
const getItemsForReports = async (req, res) => {
  try {
    
    // Obtener fechas de los parámetros
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    // Construir consulta base con includes
    const queryOptions = {
      include: [
        { model: Bicicleta, required: false },
        { 
          model: Usuario, 
          required: false,
          where: {
            usu_prueba: 0  // Añadir esta condición
          },
          include: [{ model: Empresa, required: false }]
        },
        { model: Estacion, required: false },
        { model: Comentarios, required: false }
      ],
      order: [['pre_id', 'DESC']]
    };
      
      // Construir la condición where con lógica ampliada
      let whereCondition = {};
      
      // Si hay fechas, aplicar la lógica de filtrado expandida
      if (startDate && endDate) {
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        
        whereCondition = {
          [Op.or]: [
            // 1. Fecha de retiro está entre el rango
            {
              pre_retiro_fecha: {
                [Op.between]: [startDateTime, endDateTime]
              }
            },
            // 2. Fecha de devolución está entre el rango (si existe)
            {
              pre_devolucion_fecha: {
                [Op.between]: [startDateTime, endDateTime]
              }
            },
            // 3. Periodo del préstamo intersecta con el rango (retiro antes, devolución después)
            {
              [Op.and]: [
                { pre_retiro_fecha: { [Op.lte]: startDateTime } },
                { pre_devolucion_fecha: { [Op.gte]: startDateTime } }
              ]
            },
            // 4. Préstamos activos o en estados especiales
            {
              pre_estado: {
                [Op.in]: ['ACTIVA', 'PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA']
              }
            }
          ]
        };
      } else {
        // Si no hay fechas, solo incluir los préstamos activos
        whereCondition = {
          pre_estado: {
            [Op.in]: ['ACTIVA', 'PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA']
          }
        };
      }
      
      queryOptions.where = whereCondition;
      
      const data = await prestamosModels.findAll(queryOptions);
      
      res.status(200).json({
        success: true,
        data: data
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
    
const getItemsForReportsByOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    let stationName = req.query.stationName;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
        
    if (startDate && startDate.includes('?')) startDate = startDate.split('?')[0];
    if (endDate && endDate.includes('?')) endDate = endDate.split('?')[0];
    if (stationName && stationName.includes('?')) stationName = stationName.split('?')[0];
              
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID de la organización'
      });
    }
        
 const whereCondition = literal(`
  (
      (pre_retiro_fecha BETWEEN '${startDate}' AND '${endDate} 23:59:59')
      OR (
          pre_retiro_fecha < '${startDate}'
          AND pre_estado IN ('FINALIZADA', 'FINALIZADO')
          AND pre_devolucion_fecha >= '${startDate}'
      )
      OR (
          pre_estado IN ('ACTIVA', 'PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA', 'PRESTADA')
          AND pre_retiro_fecha < '${endDate} 23:59:59'
      )
  )
  AND (
      pre_dispositivo IN ('web_pp', 'web_pe')
      OR 
      (
          pre_dispositivo NOT IN ('web_pp', 'web_pe')
          AND (
              pre_retiro_fecha IS NULL
              OR pre_devolucion_fecha IS NULL
              OR TIMESTAMPDIFF(SECOND, pre_retiro_fecha, pre_devolucion_fecha) >= 900
          )
      )
  )
`);
        
    const queryOptions = {
      attributes: [
        'pre_id', 
        'pre_usuario', 
        'pre_bicicleta', 
        'pre_retiro_fecha', 
        'pre_devolucion_fecha', 
        'pre_retiro_estacion',
        'pre_devolucion_estacion',
        'pre_estado', 
        'pre_dispositivo'
      ],
      include: [
        { 
          model: Bicicleta, 
          attributes: ['bic_id', 'bic_numero', 'bic_nombre', 'bic_estacion'],
          required: false 
        },
        { 
          model: Usuario,
          attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_genero'],
          required: true,
          where: { usu_prueba: 0 },
          include: [{
            model: Empresa,
            attributes: ['emp_id', 'emp_nombre'],
            required: true,
            where: stationName ? {} : { emp_id: organizationId }
          }]
        },
        { 
          model: Estacion,
          attributes: ['est_estacion', 'est_empresa', 'est_direccion'],
          required: stationName ? true : false,
          where: stationName ? { est_estacion: stationName } : {}
        },
        { 
          model: Comentarios, 
          attributes: ['com_calificacion', 'com_comentario'],
          required: false 
        }
      ],
      where: whereCondition,
      order: [['pre_id', 'DESC']]
    };
        
    const loans = await prestamosModels.findAll(queryOptions);
        
    const filteredLoans = loans.filter(loan => {
      const empresaUsuario = loan.bc_usuario && loan.bc_usuario.bc_empresa && loan.bc_usuario.bc_empresa.emp_nombre;
      const empresaEstacion = loan.bc_estacione && loan.bc_estacione.est_empresa;
            
      if (!loan.bc_estacione || !empresaEstacion) return true;
      if (empresaEstacion === empresaUsuario) return true;
            
      return false;
    });
        
    return res.status(200).json({
      success: true,
      data: filteredLoans,
      totalRecords: filteredLoans.length
    });
      
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
  // Función 3: Reporte por estación con filtro por fechas (usando est_id)
  const getItemsForReportsByStation = async (req, res) => {
    try {
      const { stationId } = req.params;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      
      // Validar stationId
      if (!stationId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el ID de la estación'
        });
      }
      
      // Comprobar si es un nombre de estación o un ID numérico
      const isNumericId = !isNaN(parseInt(stationId));
      
      // Construir consulta base
      const queryOptions = {
        include: [
          { model: Bicicleta, required: false },
          { 
            model: Usuario, 
            required: false,
            where: {
              usu_prueba: 0
            },
            include: [{ model: Empresa, required: false }]
          },
          { 
            model: Estacion, 
            required: true,
            where: isNumericId 
              ? { est_id: stationId } 
              : { 
                  [Op.or]: [
                    { est_estacion: stationId },
                    { est_estacion: { [Op.like]: `%${stationId}%` } }, // Búsqueda parcial
                    { est_direccion: { [Op.like]: `%${stationId}%` } } // Buscar también en dirección
                  ]
                }
          },
          { model: Comentarios, required: false }
        ],
        order: [['pre_id', 'DESC']]
      };
      

      if (data.length === 0 && !isNumericId) {
        // Eliminar caracteres especiales y buscar de nuevo
        const cleanStationName = stationId.replace(/[+]/g, ' ').trim();
        if (cleanStationName !== stationId) {
          // Intentar con el nombre limpio
          queryOptions.include[2].where = {
            [Op.or]: [
              { est_estacion: { [Op.like]: `%${cleanStationName}%` } },
              { est_direccion: { [Op.like]: `%${cleanStationName}%` } }
            ]
          };
          
          const dataRetry = await prestamosModels.findAll(queryOptions);
          if (dataRetry.length > 0) {
            return res.status(200).json({
              success: true,
              data: dataRetry
            });
          }
        }
        
        // Si aún no hay resultados, buscar de manera más general
        queryOptions.include[2].where = {
          [Op.or]: [
            { est_estacion: { [Op.like]: `%Santa Marta%` } },
            { est_direccion: { [Op.like]: `%Santa Marta%` } }
          ]
        };
        
        const fallbackData = await prestamosModels.findAll(queryOptions);
        
        return res.status(200).json({
          success: true,
          data: fallbackData,
          warning: "Se usó una búsqueda aproximada ya que no se encontró la estación exacta"
        });
      }
      
      res.status(200).json({
        success: true,
        data: data
      });
    } catch (error) {
      console.error("Error en consulta de estación:", error);
      console.error("Estación solicitada:", stationId);
      
      res.status(500).json({ 
        success: false, 
        error: error.message,
        suggestion: "Intente usar un nombre de estación diferente o vea todas las estaciones" 
      });
    }
  };
const obtenerFechaActualFormateada = () => {
    const ahora = new Date();
    const fechaColombia = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
    
    const fechaCompleta = fechaColombia;
    
    const soloHora = fechaColombia.toISOString().slice(11, 19);
    
    return {
        fechaCompleta,
        soloHora
    };
};
const finalizeLoan = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { pre_id } = req.params;
        const { userId } = req.body;
        
        const prestamo = await prestamosModels.findByPk(pre_id, {
            include: [
                { model: Bicicleta, required: true },
                { model: Usuario, required: true }
            ],
            transaction
        });
        
        if (!prestamo) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Préstamo no encontrado'
            });
        }
        
        const estadosActivos = ['ACTIVA', 'PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA'];
        if (!estadosActivos.includes(prestamo.pre_estado)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'El préstamo no está en estado activo para ser finalizado'
            });
        }

        const otrosPrestamosActivosUsuario = await prestamosModels.findAll({
            where: {
                pre_usuario: prestamo.pre_usuario,
                pre_estado: estadosActivos,
                pre_id: { [Op.ne]: pre_id }
            },
            transaction
        });

        const otrosPrestamosActivosBici = await prestamosModels.findAll({
            where: {
                pre_bicicleta: prestamo.pre_bicicleta,
                pre_estado: estadosActivos,
                pre_id: { [Op.ne]: pre_id }
            },
            transaction
        });

        const todosLosOtrosPrestamos = [...otrosPrestamosActivosUsuario, ...otrosPrestamosActivosBici];
        const otrosPrestamosActivos = todosLosOtrosPrestamos.filter((prestamo, index, self) => 
            index === self.findIndex(p => p.pre_id === prestamo.pre_id)
        );

        const todosLosPrestamos = [prestamo, ...otrosPrestamosActivos];
        const prestamoMasReciente = todosLosPrestamos.reduce((mas_reciente, actual) => {
            return new Date(actual.pre_retiro_fecha) > new Date(mas_reciente.pre_retiro_fecha) ? actual : mas_reciente;
        });

        // CAMBIO: Usar la función auxiliar en lugar del código manual
        const { fechaCompleta, soloHora } = obtenerFechaActualFormateada();

        for (const otroPrestamo of otrosPrestamosActivos) {
            if (otroPrestamo.pre_id === prestamoMasReciente.pre_id) {
                await prestamosModels.update({
                    pre_estado: 'FINALIZADA',
                    pre_devolucion_fecha: fechaCompleta,
                    pre_devolucion_hora: soloHora
                }, {
                    where: { pre_id: otroPrestamo.pre_id },
                    transaction
                });
            } else {
                await prestamosModels.update({
                    pre_estado: 'FINALIZADA'
                }, {
                    where: { pre_id: otroPrestamo.pre_id },
                    transaction
                });
            }
        }
        
        // NUEVO: Buscar información de la bicicleta para verificar si es microsistema
        const bicicleta = await Bicicleta.findByPk(prestamo.pre_bicicleta, { transaction });
        
        if (!bicicleta) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'No se encontró la bicicleta asociada a este préstamo'
            });
        }
        
        // Verificar si la bicicleta es de microsistema
        const esMicrosistema = bicicleta.bic_descripcion && 
                              bicicleta.bic_descripcion.toLowerCase().includes('microsistema');
        
        const bicicletero = await Bicicletero.findOne({
            where: { bro_bicicleta: prestamo.pre_bicicleta },
            transaction
        });
        
        if (!bicicletero) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'No se encontró el bicicletero asociado a esta bicicleta'
            });
        }
        
        const generateRandomKey = () => {
            return Math.floor(1000 + Math.random() * 9000).toString();
        };
        
        const claveAnterior = bicicletero.bro_clave;
        const claveNueva = generateRandomKey();
        
        if (prestamo.pre_id === prestamoMasReciente.pre_id) {
            await prestamosModels.update({
                pre_estado: 'FINALIZADA',
                pre_devolucion_fecha: fechaCompleta,
                pre_devolucion_hora: soloHora
            }, {
                where: { pre_id: pre_id },
                transaction
            });
        } else {
            await prestamosModels.update({
                pre_estado: 'FINALIZADA'
            }, {
                where: { pre_id: pre_id },
                transaction
            });
        }
        
        // MODIFICADO: Establecer estado de bicicleta según si es microsistema o no
        const estadoBicicleta = esMicrosistema ? 'DISPONIBLE' : 'CAMBIAR CLAVE';
        
        await Bicicleta.update({
            bic_estado: estadoBicicleta
        }, {
            where: { bic_id: prestamo.pre_bicicleta },
            transaction
        });
        
        // Solo crear historial si NO es microsistema (ya que no hay cambio de clave)
        if (!esMicrosistema) {
            // Crear registro en historial solo para bicicletas normales
            await Historiales.create({
                his_usuario: prestamo.pre_usuario,
                his_estacion: prestamo.pre_retiro_estacion,
                his_bicicletero: bicicletero.bro_id,
                his_bicicleta: prestamo.pre_bicicleta,
                his_fecha: fechaCompleta.toISOString().slice(0, 19).replace('T', ' '),
                his_clave_old: claveAnterior,
                his_clave_new: claveNueva,
                his_estado: estadoBicicleta 
            }, { transaction });
        }
        
        await transaction.commit();
        
        res.status(200).json({
            success: true,
            message: 'Préstamo finalizado exitosamente',
            data: {
                pre_id: pre_id,
                estado_prestamo: 'FINALIZADA',
                estado_bicicleta: estadoBicicleta,
                nueva_clave: esMicrosistema ? 'Sin cambio (microsistema)' : claveNueva,
                bicicletero_id: bicicletero.bro_id,
                otros_prestamos_finalizados: otrosPrestamosActivos.length,
                es_microsistema: esMicrosistema
            }
        });
        
    } catch (error) {
        await transaction.rollback();
        console.error('Error al finalizar préstamo:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al finalizar préstamo',
            error: error.message
        });
    }
};

const finalizeLoan4g = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { pre_id } = req.params;
        const { userId } = req.body;

        
        const prestamo = await prestamosModels.findByPk(pre_id, {
            include: [
                { model: Bicicleta, required: true },
                { model: Usuario, required: true }
            ],
            transaction
        });

        if (!prestamo) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Préstamo no encontrado'
            });
        }
        
        const estadosActivos = ['ACTIVA', 'PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA'];
        if (!estadosActivos.includes(prestamo.pre_estado)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'El préstamo no está en estado activo para ser finalizado'
            });
        }

        const otrosPrestamosActivosUsuario = await prestamosModels.findAll({
            where: {
                pre_usuario: prestamo.pre_usuario,
                pre_estado: estadosActivos,
                pre_id: { [Op.ne]: pre_id }
            },
            transaction
        });

        const otrosPrestamosActivosBici = await prestamosModels.findAll({
            where: {
                pre_bicicleta: prestamo.pre_bicicleta,
                pre_estado: estadosActivos,
                pre_id: { [Op.ne]: pre_id }
            },
            transaction
        });

        const todosLosOtrosPrestamos = [...otrosPrestamosActivosUsuario, ...otrosPrestamosActivosBici];
        const otrosPrestamosActivos = todosLosOtrosPrestamos.filter((prestamo, index, self) => 
            index === self.findIndex(p => p.pre_id === prestamo.pre_id)
        );

        const todosLosPrestamos = [prestamo, ...otrosPrestamosActivos];
        const prestamoMasReciente = todosLosPrestamos.reduce((mas_reciente, actual) => {
            return new Date(actual.pre_retiro_fecha) > new Date(mas_reciente.pre_retiro_fecha) ? actual : mas_reciente;
        });

        // CAMBIO: Usar la función auxiliar en lugar del código manual
        const { fechaCompleta, soloHora } = obtenerFechaActualFormateada();

        for (const otroPrestamo of otrosPrestamosActivos) {
            if (otroPrestamo.pre_id === prestamoMasReciente.pre_id) {
                await prestamosModels.update({
                    pre_estado: 'FINALIZADA',
                    pre_devolucion_fecha: fechaCompleta,
                    pre_devolucion_hora: soloHora
                }, {
                    where: { pre_id: otroPrestamo.pre_id },
                    transaction
                });
            } else {
                await prestamosModels.update({
                    pre_estado: 'FINALIZADA'
                }, {
                    where: { pre_id: otroPrestamo.pre_id },
                    transaction
                });
            }
        }
        
        if (prestamo.pre_id === prestamoMasReciente.pre_id) {
            await prestamosModels.update({
                pre_estado: 'FINALIZADA',
                pre_devolucion_fecha: fechaCompleta,
                pre_devolucion_hora: soloHora
            }, {
                where: { pre_id: pre_id },
                transaction
            });
        } else {
            await prestamosModels.update({
                pre_estado: 'FINALIZADA'
            }, {
                where: { pre_id: pre_id },
                transaction
            });
        }
        
        await Bicicleta.update({
            bic_estado: 'DISPONIBLE'
        }, {
            where: { bic_id: prestamo.pre_bicicleta },
            transaction
        });
        
        await transaction.commit();
        
        res.status(200).json({
            success: true,
            message: 'Préstamo 4G finalizado exitosamente',
            data: {
                pre_id: pre_id,
                estado_prestamo: 'FINALIZADA',
                estado_bicicleta: 'DISPONIBLE',
                otros_prestamos_finalizados: otrosPrestamosActivos.length
            }
        });
        
    } catch (error) {
        await transaction.rollback();
        console.error('Error al finalizar préstamo 4G:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al finalizar préstamo 4G',
            error: error.message
        });
    }
};
  const getItem_cortezza = async (req, res) => {
      try {
          req = matchedData(req)
          const {pre_id} = req
          const data = await prestamosModels.findByPk(pre_id, {
              include: [
                  {
                      model: Estacion,
                      attributes: ['est_empresa'],
                      where : {
                          est_empresa : nombre_cortezza
                      }
                  }
              ]
          });
          res.send({data});
      } catch (e) {
          httpError(res, "ERROR_GET_USER")
      }
  };

const getItems_cortezza = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await prestamosModels.findAll({
            include: [
                {
                    model: Estacion,
                    attributes: ['est_empresa'],
                    where : {
                        est_empresa : nombre_cortezza
                    }
                }
            ]
        });
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_PRESTAMOS");
    }
};

const getItemAllPrestamoActivos_cortezza = async (req, res) => {
    try {
        const data = await prestamosModels.findAll({
            include:[
                {
                    model: Bicicleta,
                    attributes: ['bic_numero'],
                },
                {
                    model: Usuario,
                    include:[{
                        model: Empresa
                    }]
                },
                {
                    model: Estacion,
                    attributes: ['est_empresa'],
                    where : {
                        est_empresa : nombre_cortezza
                    }
                }
            ],
            where:  {
                pre_estado: 'ACTIVA'
            },
            order: [
                ['pre_id', 'DESC']
            ]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `Error prestamos activos ${e}`)
    }
};

const getItemAllPrestamoFinalizados_cortezza = async (req, res) => {
    try {
        const data = await prestamosModels.findAll({
            include:[
                {
                    model: Bicicleta,
                    attributes: ['bic_numero'],
                },
                {
                    model: Usuario,
                    include:[{
                        model: Empresa,
                    }]
                },
                {
                    model: Estacion,
                    attributes: ['est_empresa'],
                    where : {
                        est_empresa : nombre_cortezza
                    }
                }
            ],
            where:
            {
                pre_estado: 'FINALIZADA'
            },
            order: [
                ['pre_id', 'DESC']
            ]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `Error prestamos finalizados ${e}` )
    }
};

const getItemPrestamoActivo_cortezza = async (req, res) => {
    try {
        req = matchedData(req)
        const { pre_usuario } = req
        const data = await prestamosModels.findAll({
            where:  {
                pre_usuario: pre_usuario,
                pre_estado: 'ACTIVA'
            },
            include: [
                {
                    model: Estacion,
                    attributes: ['est_empresa'],
                    where : {
                        est_empresa : nombre_cortezza
                    }
                }
            ]
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PRESTAMOS_USUARIO")
    }
};

const getItemPrestamosUsuario_cortezza = async (req, res) => {
    try {
        req = matchedData(req)
        const { pre_usuario } = req
        const data = await prestamosModels.findAll({
            include:[
                {
                    model: Bicicleta,
                    attributes: [
                        'bic_id', 
                        'bic_nombre', 
                        'bic_numero', 
                        'bic_estacion', 
                        'bic_estado', 
                        'bic_descripcion',
                    ],
                },
                {
                    model: Bicicletero,
                    attributes: [
                        'bro_id',
                        'bro_nombre',  
                        'bro_estacion',  
                        'bro_numero',  
                        'bro_bicicleta', 
                        'bro_bluetooth',  
                        'bro_clave'
                    ],
                },
                {
                    model: Estacion,
                    attributes: ['est_empresa'],
                    where : {
                        est_empresa : nombre_cortezza
                    }
                }
            ],
            where: {pre_usuario: pre_usuario}
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PRESTAMOS_USUARIO_VIAJESSS")
    }
};

//controlador para obtener metricas de un organizacion
// const getMetricsForOrganization = async (req, res) => {
//   try {
//     const { organizationId } = req.params;
//     const startDate = '2025-01-01 00:00:00';
//     const endDate = req.query.endDate || new Date().toISOString().split('T')[0] + ' 23:59:59';
    
//     const whereCondition = literal(`
//       (
//           (pre_retiro_fecha BETWEEN '${startDate}' AND '${endDate}')
//           OR (
//               pre_retiro_fecha < '${startDate}'
//               AND pre_estado IN ('FINALIZADA', 'FINALIZADO')
//               AND pre_devolucion_fecha BETWEEN '${startDate}' AND '${endDate}'
//           )
//           OR (
//               pre_estado IN ('ACTIVA', 'PRESTAMO PERSONALIZADO', 'PRESTAMO DE EMERGENCIA', 'PRESTADA')
//               AND pre_retiro_fecha < '${endDate}'
//           )
//       )
//       AND (
//           pre_dispositivo IN ('web_pp', 'web_pe')
//           OR 
//           (
//               pre_dispositivo NOT IN ('web_pp', 'web_pe')
//               AND (
//                   pre_retiro_fecha IS NULL
//                   OR pre_devolucion_fecha IS NULL
//                   OR TIMESTAMPDIFF(SECOND, pre_retiro_fecha, pre_devolucion_fecha) >= 900
//               )
//           )
//       )
//     `);
    
//     const loans = await prestamosModels.findAll({
//       attributes: ['pre_id', 'pre_usuario', 'pre_retiro_fecha', 'pre_devolucion_fecha', 'pre_estado'],
//       include: [
//         { 
//           model: Bicicleta, 
//           attributes: ['bic_nombre'],
//           required: false 
//         },
//         { 
//           model: Usuario,
//           attributes: ['usu_documento', 'usu_recorrido'],
//           required: true,
//           where: { usu_prueba: 0 },
//           include: [{
//             model: Empresa,
//             attributes: ['emp_id', 'emp_nombre'],
//             required: true,
//             where: { emp_id: organizationId }
//           }]
//         }
//       ],
//       where: whereCondition,
//       raw: true
//     });

//     const fechaInicio = new Date(startDate);
//     fechaInicio.setHours(0, 0, 0, 0);
//     const fechaFin = new Date(endDate);
//     fechaFin.setHours(23, 59, 59, 999);

//     const viajesPorUsuario = new Map();
//     const usuariosUnicos = new Set();

//     loans.forEach(loan => {
//       const userId = loan.pre_usuario;
//       if (!userId) return;

//       usuariosUnicos.add(userId);

//       let fechaRetiro = new Date(loan.pre_retiro_fecha);
//       if (isNaN(fechaRetiro.getTime())) return;

//       let fechaDevolucion = null;
//       if (loan.pre_devolucion_fecha) {
//         fechaDevolucion = new Date(loan.pre_devolucion_fecha);
//         if (isNaN(fechaDevolucion.getTime())) fechaDevolucion = null;
//       }

//       const estadoPrestamo = (loan.pre_estado || '').toUpperCase();
//       const esPrestamoActivo = estadoPrestamo.includes('ACTIVA') || 
//                                estadoPrestamo.includes('PERSONALIZADO') || 
//                                estadoPrestamo.includes('EMERGENCIA') ||
//                                estadoPrestamo.includes('PRESTADA');

//       if (esPrestamoActivo) {
//         fechaDevolucion = new Date(fechaFin);
//       } else if (!fechaDevolucion) {
//         fechaDevolucion = new Date(fechaRetiro);
//         fechaDevolucion.setHours(23, 59, 59);
//       }

//       if (fechaRetiro > fechaFin || fechaDevolucion < fechaInicio) return;

//       const fechaInicioEfectiva = fechaRetiro < fechaInicio ? fechaInicio : fechaRetiro;
//       const fechaFinEfectiva = fechaDevolucion > fechaFin ? fechaFin : fechaDevolucion;

//       const diasSet = new Set();
//       const fechaTemp = new Date(fechaInicioEfectiva);
//       fechaTemp.setHours(0, 0, 0, 0);
//       const fechaFinComparable = new Date(fechaFinEfectiva);
//       fechaFinComparable.setHours(0, 0, 0, 0);

//       while (fechaTemp <= fechaFinComparable) {
//         diasSet.add(fechaTemp.toISOString().split('T')[0]);
//         fechaTemp.setDate(fechaTemp.getDate() + 1);
//       }

//       const viajesEstePrestamo = diasSet.size * 2;
//       viajesPorUsuario.set(userId, (viajesPorUsuario.get(userId) || 0) + viajesEstePrestamo);
//     });

//     let totalDistancia = 0;
//     const usuariosContados = new Set();
    
//     loans.forEach(loan => {
//       const userId = loan.pre_usuario;
//       if (!userId || usuariosContados.has(userId)) return;
//       usuariosContados.add(userId);

//       const userViajes = viajesPorUsuario.get(userId) || 0;
//       if (userViajes <= 0) return;

//       let distancia = 15;
//       if (loan['bc_usuario.usu_recorrido']) {
//         const recorrido = loan['bc_usuario.usu_recorrido'];
//         if (typeof recorrido === 'string' && /^\d+(\.\d+)?$/.test(recorrido.trim())) {
//           distancia = parseFloat(recorrido);
//         } else if (typeof recorrido === 'number') {
//           distancia = recorrido;
//         }
//       }

//       const distanciaPorViaje = distancia / 2;
//       const distanciaTotal = distanciaPorViaje * userViajes;
//       totalDistancia += distanciaTotal;
//     });

//     let totalViajes = 0;
//     viajesPorUsuario.forEach(viajes => {
//       totalViajes += viajes;
//     });

//     const totalCO2 = (totalDistancia * 249) / 1000;
//     const arbolesSalvados = Math.round((totalCO2 * 249) / 1000);

//     const metrics = {
//       totalViajes,
//       usuariosUnicos: usuariosUnicos.size,
//       promedioViajesPorUsuario: Math.round(totalViajes / usuariosUnicos.size),
//       promedioDistanciaPorViaje: Math.round((totalDistancia / totalViajes) * 100) / 100,
//       totalDistancia: Math.round(totalDistancia),
//       totalCO2: Math.round(totalCO2 * 100) / 100,
//       arbolesSalvados
//     };

//     console.log('=== METRICS ===');
//     console.log('Total Viajes:', metrics.totalViajes);
//     console.log('Usuarios Unicos:', metrics.usuariosUnicos);
//     console.log('Promedio Viajes/Usuario:', metrics.promedioViajesPorUsuario);
//     console.log('Promedio Distancia/Viaje:', metrics.promedioDistanciaPorViaje, 'km');
//     console.log('Total Distancia (km):', metrics.totalDistancia);
//     console.log('Total CO2 (kg):', metrics.totalCO2);
//     console.log('Arboles Salvados:', metrics.arbolesSalvados);
//     console.log('');
//     console.log('VERIFICACION:');
//     console.log(metrics.usuariosUnicos, 'usuarios *', metrics.promedioViajesPorUsuario, 'viajes/usuario *', metrics.promedioDistanciaPorViaje, 'km/viaje =', Math.round(metrics.usuariosUnicos * metrics.promedioViajesPorUsuario * metrics.promedioDistanciaPorViaje), 'km');
//     console.log('===============');

//     return res.status(200).json({
//       success: true,
//       data: metrics
//     });
      
//   } catch (error) {
//     console.error('Error:', error);
//     return res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };


module.exports = {
    getItems, getItem, getItemUsuario, createItem, updateItem, deleteItem, getItemPrestamoActivo, getItemPrestamoActivoPP,
    getItemPrestamosUsuario, getItemAllPrestamoActivos, getItemAllPrestamoFinalizados, getItemsToDate,
     getItemAllPrestamoFinalizados3g, getItemAllPrestamoFinalizados4g, patchItem,
      getItemByBicicleta, getItem_cortezza, getItems_cortezza, getItemAllPrestamoActivos_cortezza,
       getItemAllPrestamoFinalizados_cortezza, getItemPrestamoActivo_cortezza, getItemPrestamosUsuario_cortezza,
    getItemsForReports,getItemsForReportsByOrganization,getItemsForReportsByStation,finalizeLoan, finalizeLoan4g,
}
