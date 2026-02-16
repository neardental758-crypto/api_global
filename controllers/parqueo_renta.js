const { matchedData } = require('express-validator');
const { rentaParqueoModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const Parqueaderos = require('../models/mysql/parqueo_parqueaderos');
const Empresa = require('../models/mysql/empresa');
const Lugar_parqueo = require('../models/mysql/parqueo_lugar');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await rentaParqueoModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_RENTAS_PARQUEO");
    }
};

const getItemsToDate = async (req, res) => {
        try {
        const filtro = JSON.parse(req.query.filter);
        const startedDate = new Date(filtro.startDate);
        const endDate = new Date(filtro.endDate);
        const data = await rentaParqueoModels.findAll({
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
        const {id} = req
        const data = await rentaParqueoModels.findByPk(id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_RENTAS_PARQUEO")
    }
};

const getItemUsuario = async (req, res) => {
    try {
        req = matchedData(req)
        const { usuario } = req
        const data = await rentaParqueoModels.findAll({ where: { usuario: usuario }});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_RENTAS_PARQUEO_USUARIO")
    }
};

const getItemPrestamoActivo = async (req, res) => {
    try {
        req = matchedData(req)
        const { usuario } = req
        const data = await rentaParqueoModels.findAll({
            where:  {
                usuario: usuario,
                estado: 'ACTIVA'
            },
            include: {
                model: Lugar_parqueo
            }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_RENTAS_PARQUEO_USUARIO")
    }
};

const getItemAllPrestamoActivos = async (req, res) => {
    try {
        const data = await rentaParqueoModels.findAll({
            include:[{
                model: Lugar_parqueo,
                attributes: ['numero'],
              },
              {
                model: Usuario,
                include:[{
                    model: Empresa
                 }]
             }],
            where:  {
                estado: 'ACTIVA'
            },
            order: [
                ['fecha', 'DESC']
            ]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `Error prestamos activos ${e}`)
    }
};

const getItemAllPrestamoFinalizados = async (req, res) => {
    try {
        const data = await rentaParqueoModels.findAll({
            include:[{
                model: Lugar_parqueo,
                attributes: ['numero'],
              },
              {
                model: Usuario,
                include:[{
                    model: Empresa,
                  }]
              },
            ],
            where:
            {
                estado: 'FINALIZADA'
            },
            order: [
                ['fecha', 'DESC']
            ]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `Error prestamos finalizados ${e}` )
    }
};

const temporizador = async (inicio, fin, lugar, usuario) => {
  try {
    // Convertir "HH:mm:ss" a objetos Date (usando la fecha actual)
    const ahora = new Date();
    const [hInicio, mInicio, sInicio] = inicio.split(':').map(Number);
    const [hFin, mFin, sFin] = fin.split(':').map(Number);

    const fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), hInicio, mInicio, sInicio);
    const fechaFin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), hFin, mFin, sFin);

    // Si la hora de fin es del día siguiente
    if (fechaFin < fechaInicio) {
      fechaFin.setDate(fechaFin.getDate() + 1);
    }

    // Calcular duración en minutos
    const duracion = Math.floor((fechaFin - fechaInicio) / 60000);

    console.log(`⏳ Temporizador iniciado para usuario ${usuario}, duración: ${duracion} minutos en lugar ${lugar}`);

    // Ejecutar la acción cuando se cumpla el tiempo
    setTimeout(async () => {
      try {
        const rentar = await rentaParqueoModels.findOne({
          where: { usuario: usuario, estado: 'ACTIVA' }
        });

        console.log(`⏰ Verificando reserva para cancelación automática...`, rentar);

        if (rentar) {
          await rentaParqueoModels.update(
            { estado: 'FINALIZADA' },
            { where: { usuario: usuario, estado: 'ACTIVA' } }
          );

          console.log(`✅ Reserva de usuario ${usuario} finalizada automáticamente`);

          await Lugar_parqueo.update(
            { estado: 'DISPONIBLE' },
            { where: { id: lugar } }
          );

          console.log(`🚲 La bicicleta ${lugar} está disponible nuevamente`);
        } else {
          console.log(`ℹ️ Reserva de usuario ${usuario} ya no estaba activa al momento del timeout`);
        }
      } catch (err) {
        console.error("❗ Error al finalizar reserva en temporizador:", err);
      }
    }, duracion * 60 * 1000); // minutos → milisegundos

  } catch (error) {
    console.error("❗ ERROR en temporizador:", error);
  }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await rentaParqueoModels.create(body)
        temporizador(body.inicio, body.fin, body.Lugar_parqueo, body.usuario)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_RENTA_PARQUEO")
    }

};


const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await rentaParqueoModels.update(
            {
                estado: body.estado,
            },
            {
                where: { id : body.id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_RENTA_PARQUEO");
    }
};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const id = req.params.id;
    try {
        const data = await rentaParqueoModels.update(
        objetoACambiar,
        {
            where: { id: id }
        })
        res.send('ok');
    } catch (error) {
        httpError(res, `ERROR_UPDATE_ESTADO_RENTA_PARQUEO `);
    }
};


const getElectroHubReports = async (req, res) => {
    try {
        const { empresaId } = req.params;
        
        if (!empresaId) {
            return res.send({data: []});
        }
        
        const empresa = await Empresa.findOne({ 
            where: { emp_id: empresaId }
        });
        
        if (!empresa) {
            return res.send({data: []});
        }
        
        const data = await rentaParqueoModels.findAll({
            include: [{
                model: Usuario,
                where: { usu_empresa: empresa.emp_nombre },
                attributes: ['usu_documento', 'usu_nombre', 'usu_empresa', 'usu_recorrido', 'usu_creacion'],
                include: [{
                    model: Empresa,
                    attributes: ['emp_nombre']
                }]
            }, {
                model: Lugar_parqueo,
                attributes: ['numero', 'parqueadero'],
                include: [{
                    model: Parqueaderos,
                    attributes: ['nombre']
                }]
            }],
            order: [['fecha', 'DESC']]
        });
        
        const processedData = data.map(item => {
            const usuario = item.Usuario || {};
            const distanciaUsuario = parseFloat(usuario.usu_recorrido) || 7.5;
            const distanciaTotal = distanciaUsuario * 2;
            const consumoElectrico = distanciaTotal * 0.15;
            
            return {
                ...item.toJSON(),
                distancia_calculada: distanciaTotal,
                consumo_electrico_calculado: consumoElectrico
            };
        });
        
        res.send({ data: processedData });
    } catch (error) {
        console.error('Error en getElectroHubReports:', error);
        httpError(res, `ERROR_GET_ELECTROHUB_REPORTS: ${error.message}`);
    }
};

const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, getItemUsuario, createItem, temporizador, updateItem, deleteItem, getItemPrestamoActivo, getItemAllPrestamoActivos, getItemAllPrestamoFinalizados, getItemsToDate, patchItem, getElectroHubReports
}
