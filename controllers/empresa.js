const { matchedData } = require('express-validator');
const { empresaModels, usuarioModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');
const Estacion = require('../models/mysql/estacion');
const Contrato = require('../models/mysql/contratos');
const Oficina = require('../models/mysql/oficinas');
const _id_cortezza = '627a8c9931feb31c33377d0e';
const nombre_cortezza = 'Cortezza MDN';
const { estacionModels } = require('../models');
const sequelize = require("../config/mysql"); // Ajusta la ruta según tu estructura


const getItems = async (req, res) => {
    try {
        const data = await empresaModels.findAll({
            include : [{
                model : Contrato
            },
            {
                model : Oficina
            }]
        });
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_EMPRESA");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {emp_id} = req
        const data = await empresaModels.findByPk(emp_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_EMPRESA")
    }
};

const getItemFilterOrganitationFromStation = async (req, res) => {
    try {
        req = matchedData(req);
        const {emp_id} = req;
        const data = await empresaModels.findAll({
            where : { emp_id : emp_id },
            include: [{
                model: Estacion,
                attributes: ['est_estacion', 'est_direccion', 'est_latitud', 'est_longitud'],
            }]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_EMPRESA`)
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await empresaModels.create(body)
        res.send({data})
    } catch (e) {
        httpError(res, `ERROR_POST_EMPRESA`)
    }
};

const getUsuariosCountByOrganization = async (req, res) => {
  try {
    const emp_id = req.params.emp_id;
    
    let startDate, endDate;
    
    if (req.query.filter) {
      try {
        const filterObj = JSON.parse(req.query.filter);
        startDate = filterObj.startDate;
        endDate = filterObj.endDate;
      } catch (e) {
      }
    }
    
    if (!startDate && !endDate) {
      startDate = req.query.startDate;
      endDate = req.query.endDate;
    }
    
    if (!emp_id) {
      return httpError(res, "ID de empresa no proporcionado");
    }
    
    const empresa = await empresaModels.findOne({
      where: { emp_id }
    });
    
    if (!empresa) {
      return httpError(res, "Empresa no encontrada");
    }
    
    const totalUsuarios = await usuarioModels.count({
      where: {
        usu_empresa: empresa.emp_nombre,
        [Op.or]: [
          { usu_prueba: 0 },
          { usu_prueba: { [Op.is]: null } }
        ]
      }
    });

    
    let usuariosNuevos = 0;
    if (startDate && endDate) {
      const fechaInicioStr = startDate.slice(0, 19).replace('T', ' ');
      const fechaFinStr = endDate.slice(0, 19).replace('T', ' ');
      
      usuariosNuevos = await usuarioModels.count({
        where: {
          usu_empresa: empresa.emp_nombre,
          [Op.or]: [
            { usu_prueba: 0 },
            { usu_prueba: { [Op.is]: null } }
          ],
          usu_creacion: {
            [Op.not]: null,
            [Op.ne]: '',
            [Op.between]: [fechaInicioStr, fechaFinStr]
          }
        }
      });
      
    }
    
    const resultado = { 
      totalUsers: totalUsuarios,
      newUsers: usuariosNuevos 
    };
    
    res.send({ data: resultado });
    
  } catch (e) {
    httpError(res, `ERROR_GET_USUARIOS_COUNT`);
  }
};

const getUsuariosCount = async (req, res) => {
  try {
    const totalUsuarios = await usuarioModels.count({
      where: {
        [Op.or]: [
          { usu_prueba: 0 },
          { usu_prueba: { [Op.is]: null } }
        ]
      }
    });

    
    res.send({ data: totalUsuarios });
    
  } catch (e) {
    httpError(res, `ERROR_GET_ALL_USUARIOS_COUNT`);
  }
};

const getUsersByStation = async (req, res) => {
  try {
    const estacionNombre = req.params.estacionId;
    
    let startDate, endDate;
    
    if (req.query.filter) {
      try {
        const filterObj = JSON.parse(req.query.filter);
        startDate = filterObj.startDate;
        endDate = filterObj.endDate;
      } catch (e) {
      }
    }
    
    if (!startDate && !endDate) {
      startDate = req.query.startDate;
      endDate = req.query.endDate;
    }
    
    let estacion = await estacionModels.findOne({
      where: { est_estacion: estacionNombre }
    });
    
    if (!estacion) {
      estacion = await estacionModels.findOne({
        where: sequelize.where(
          sequelize.fn('TRIM', sequelize.col('est_estacion')), 
          estacionNombre.trim()
        )
      });
    }
    
    if (!estacion) {
      const similares = await estacionModels.findAll({
        where: {
          est_estacion: {
            [Op.like]: `%${estacionNombre.substring(0, 10)}%`
          }
        },
        attributes: ['est_estacion', 'est_direccion']
      });
      
      if (similares.length > 0) {
        estacion = similares[0];
      }
    }
    
    if (!estacion) {
      return res.send({ data: { totalUsers: 0, newUsers: 0 } });
    }
    
    const baseQuery = {
      usu_dir_trabajo: estacion.est_direccion,
      [Op.or]: [
        { usu_prueba: 0 },
        { usu_prueba: { [Op.is]: null } }
      ]
    };
    
    const totalUsers = await usuarioModels.count({ where: baseQuery });
    
    
    let newUsers = 0;
    
    if (startDate && endDate) {
      try {
        const fechaInicioStr = startDate.slice(0, 19).replace('T', ' ');
        const fechaFinStr = endDate.slice(0, 19).replace('T', ' ');
        
        const newUsersQuery = {
          ...baseQuery,
          usu_creacion: {
            [Op.not]: null,
            [Op.ne]: '',
            [Op.between]: [fechaInicioStr, fechaFinStr]
          }
        };
        
        newUsers = await usuarioModels.count({ where: newUsersQuery });
      } catch (error) {
        newUsers = 0;
      }
    }

    const resultado = { totalUsers, newUsers };
    res.send({ data: resultado });
    
  } catch (e) {
    res.send({ data: { totalUsers: 0, newUsers: 0 } });
  }
};
  const getItemByName = async (req, res) => {
    try {
        req = matchedData(req);
        const { emp_nombre } = req;
        
        const data = await empresaModels.findOne({
            where: { 
                emp_nombre: emp_nombre 
            },
            attributes: ['emp_id', 'emp_nombre'] // Solo retornamos id y nombre
        });
        
        if (data) {
            res.send({ data });
        } else {
            res.status(404).send({ error: "Organización no encontrada" });
        }
    } catch (e) {
        console.error(e);
        httpError(res, "ERROR_GET_EMPRESA_BY_NAME");
    }
};



const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

function obtenerDominio(email) {
    // Verificar que la cadena de entrada es válida y contiene un '@'
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid input: must be a valid email string');
    }
    
    // Dividir la cadena en dos partes usando '@' como separador
    const partes = email.split('@');
    
    // Retornar la parte que está después del '@'
    return partes[1];
}

const getItemEmail = async (req, res) => {
    try {
        req = matchedData(req);
        const { emp_email } = req;
        const domain = obtenerDominio(emp_email);

        const data = await empresaModels.findAll({
            where: {
                emp_email: {
                    [Op.like]: `%${domain}%`
                },
                emp_estado: 'ACTIVA'
            }
        });
        if (data.length > 0) {
            res.status(200).send({ data });
        } else {
            res.status(404).send('no');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('ERROR_GET_EMPRESA');
    }
};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const emp_id = req.params.emp_id;
    const result = await empresaModels.update(objetoACambiar, {
            where: { emp_id: emp_id }
        });
        if (result[0] > 0) {
            res.status(200).json({
                status: 200,
                data: objetoACambiar,
                message: "Update EMPRESA"
            });
        } else {
            res.json({
                message: "Update EMPRESA failed: No rows affected"
            });
        }
};

const updateOrganization = async (req, res) => {
    try {
        const objetoACambiar = { ...req.body };
        const emp_id = req.params.emp_id;
        
        // Simplemente omitir el campo emp_nombre del update para evitar conflictos
        delete objetoACambiar.emp_nombre;
        
        if (Object.keys(objetoACambiar).length === 0) {
            return res.status(400).json({
                message: "No hay campos válidos para actualizar"
            });
        }

        const result = await empresaModels.update(objetoACambiar, {
            where: { emp_id: emp_id }
        });
        
        if (result[0] > 0) {
            res.status(200).json({
                status: 200,
                data: objetoACambiar,
                message: "Update EMPRESA"
            });
        } else {
            res.json({
                message: "Update EMPRESA failed: No rows affected"
            });
        }
    } catch (error) {
        console.error("Error updating empresa:", error);
        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
};



const getItemEmail_cortezza = async (req, res) => {
    try {
        req = matchedData(req);
        const { emp_email } = req;
        const domain = obtenerDominio(emp_email);

        const data = await empresaModels.findAll({
            where: {
                emp_email: {
                    [Op.like]: `%${domain}%`
                },
                emp_estado: 'ACTIVA',
                emp_id: _id_cortezza

            },
            
        });
        if (data.length > 0) {
            res.status(200).send({ data });
        } else {
            res.status(404).send('no');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('ERROR_GET_EMPRESA');
    }
};

const getItemFilterOrganitationFromStation_cortezza = async (req, res) => {
    try {
        req = matchedData(req);
        const {emp_id} = req;
        const data = await empresaModels.findAll({
            where : { 
                emp_id : emp_id,
                emp_id : _id_cortezza
            },
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_EMPRESA`)
    }
};

const getEmpresasWithStations = async (req, res) => {
    try {
        const data = await empresaModels.findAll({
            include: [{
                model: Estacion,
                attributes: ['est_estacion', 'est_direccion', 'est_ciudad', 'est_latitud', 'est_longitud', 'est_num_bicicleteros', 'est_automatizada', 'est_habilitada', 'est_id'],
            }],
        });
        
        res.send({ data });
    } catch (error) {
        console.error(error);
        httpError(res, "ERROR_GET_EMPRESAS_WITH_STATIONS");
    }
};


module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem, getItemEmail, patchItem, getItemFilterOrganitationFromStation,getItemFilterOrganitationFromStation_cortezza,
     getItemEmail_cortezza, getUsuariosCountByOrganization,getUsuariosCount,getItemByName,getEmpresasWithStations,getUsersByStation,updateOrganization
}
