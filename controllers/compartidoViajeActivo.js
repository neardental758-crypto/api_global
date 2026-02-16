
const { Op } = require('sequelize');
const { sequelize } = require('../config/mysql');
const { matchedData } = require('express-validator');
const { compartidoViajeActivoModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { calcularDistanciaPerpendicularPuntoRuta } = require('../services/calculateRoute');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');
const Solicitud = require('../models/mysql/compartidoSolicitud');
const Vehiculo = require('../models/mysql/compartidoVehiculos');
const Comentarios = require('../models/mysql/compartidoComentarios');
const Conductor = require('../models/mysql/compartidoConductor');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await compartidoViajeActivoModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOVIAJEACTIVO");
    }
};

const getItemsFilterOrganization = async (req, res) => {
    req = matchedData(req)
    const { organizationId } = req
    try {
        const data = await compartidoViajeActivoModels.findAll({
            attributes : ['lSalida', 'llegada', "fecha", "asientosIda", "asientosVuelta", "distancia", "duracionGoogle"],
            include : [{
                model : Usuario,
                attributes : ['usu_documento', 'usu_nombre'],
                include:[{
                    model: Empresa,
                    attributes: ['emp_id'],
                    where : {
                        emp_id : organizationId
                    }
                  }],
                  required: true
            },{
                model : Vehiculo,
                attributes : ['tipo'],
            },{
                model : Comentarios,
                attributes : ['calificacion'],
                as: 'compartidoComentarios'
            }]
        });
        res.send({data});
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM_COMPARTIDOVIAJEACTIVO ${error}`);
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {_id} = req
        const data = await compartidoViajeActivoModels.findOne({
            where: { _id: _id },
            include: [{
                model: Vehiculo
            }]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_COMPARTIDOVIAJEACTIVO ${e}` )
    }
};
const getItemPrestamoActivo = async (req, res) => {
    try {
        req = matchedData(req)
        const { _id } = req
        const data = await compartidoViajeActivoModels.findAll({
            where:  {
                _id: _id,
                estado: 'ACTIVA'
            }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PRESTAMOS_USUARIO")
    }
};

const getItemTripEnd = async (req, res) => {
    try {
        req = matchedData(req)
        const { conductor } = req
        const data = await compartidoViajeActivoModels.findAll({
            where:  {
                conductor: conductor,
                estado: 'FINALIZADA'
            },
            include: [
                { model: Vehiculo },
                {
                    model: Comentarios,
                    attributes: ['calificacion', 'comentario', 'idEnvio', '_id'],
                    as: 'compartidoComentarios',
                    include: [
                        { model: Usuario, as: 'usuarioEnviado' } // Alias actualizado
                    ]
                }
            ]
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_VIAJES_END_USUARIO")
    }
};
const getItemPrestamoActivoConductor = async (req, res) => {
    try {
        req = matchedData(req)
        const { conductor } = req
        const data = await compartidoViajeActivoModels.findAll({
            where:  {
                conductor: conductor,
                estado: 'ACTIVA'
            }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_VIAJES_ACTIVOS_CONDUCTOR")
    }
};
const getItemPrestamoActivoConductorProceso = async (req, res) => {
    try {
        req = matchedData(req)
        const { conductor } = req
        const data = await compartidoViajeActivoModels.findAll({
            where:  {
                conductor: conductor,
                estado: 'PROCESO'
            },
            include:[{
                model: Vehiculo
            }]
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PRESTAMOS_USUARIO")
    }
};
const getItemPrestamoActivoOrganizacion = async (req, res) => {
    try {
        req = matchedData(req)
        const { idOrganizacion } = req
        const data = await compartidoViajeActivoModels.findAll({
            where:  {
                idOrganizacion: idOrganizacion,
                estado: 'ACTIVA'
            }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PRESTAMOS_USUARIO")
    }
};
const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoViajeActivoModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_COMPARTIDOVIAJEACTIVO")
    }

};
const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoViajeActivoModels.update(
            {
                //data a cambiar

            },
            {
                //Identificador
                where: { _id : body._id },
            }
        )
        res.send('Item Update Complete');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_COMPARTIDOVIAJEACTIVO");
    }
};

const getItemAllPrestamoActivos = async (req, res) => {
    try {
        const data = await compartidoViajeActivoModels.findAll({
            where:  {
                estado: 'ACTIVA'
            },
            order: [
                ['_id', 'DESC']
            ]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `Error prestamos activos ${e}`)
    }
};

const getItemAllPrestamoActivosFiltered = async (req, res) => {
    try {
      const documento = req.params.documento;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 5 );
      currentDate = currentDate.toISOString();
    // Falta agretar filtro por metodo de transporte, pago, posicion
      const data = await compartidoViajeActivoModels.findAll({
        where: {
          conductor: { [Op.ne]: documento },
          estado: 'ACTIVA',
          asientosIda: { [Op.gt]: 0 },
          fecha: { [Op.gt]: currentDate },
        },
        include: [
          {
            model: Usuario,
            attributes: ['usu_documento', 'usu_nombre', 'usu_viajes', 'usu_calificacion'],
            include: [
              {
                model: Conductor,
                as: 'conductor',
                attributes: ['viajes'],
              },
            ],
          },
          {
            model: Vehiculo,
            attributes: ['tipo', 'placa'],
          },
          {
            model: Solicitud,
            as: 'viajeSolicitado',
            attributes: ['idSolicitante', 'estadoSolicitud'],
            where: {
              estadoSolicitud: { [Op.not]: 'CANCELADA' },
            },
            required: false,
          },
        ],
      });
  
      // Filtrar los viajes donde el usuario ya está registrado
      const filteredData = data.filter(viaje => {
        if (viaje.viajeSolicitado.length === 0) {
          return true;
        } else {
          return !viaje.viajeSolicitado.some(solicitud => solicitud.idSolicitante === documento);
        }
      });
  
      // Calcular el total de elementos (totalItems) basándonos en los resultados filtrados
      const totalItems = filteredData.length;
  
      // Aplicar la paginación sobre los resultados filtrados
      const paginatedData = filteredData.slice(offset, offset + limit);
  
      // Calcular el número total de páginas
      const totalPages = Math.ceil(totalItems / limit);
  
      // Devolvemos los datos filtrados y la paginación
      res.send({
        data: paginatedData,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
      });
    } catch (e) {
      // Manejo de errores
      httpError(res, `Error prestamos activos ${e}`);
    }
  };

  const getItemAllPrestamoActivosFilteredToAplication = async (req, res) => {
    const { documento } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; 
    const position1 = req.query.position1 ? JSON.parse(req.query.position1) : { lat: '', lng: '' };
    const position2 = req.query.position2 ? JSON.parse(req.query.position2) : { lat: '', lng: '' };
    const offset = (page - 1) * limit;
    const fechaInicio = req.query.fechaInicio;
    const subtractHours = (date, hours) => {
        const newDate = new Date(date);
        newDate.setHours(newDate.getHours() - hours);
        return newDate;
    };
    const fechaParaFiltrar = fechaInicio ? subtractHours(fechaInicio, 2).toISOString(): subtractHours(new Date(), 2).toISOString();
    let { pago, transporte } = req.query;
    if (pago) { pago = pago.split(','); } else { pago = []; }
    if (transporte) { transporte = transporte.split(','); } else { transporte = []; }
    const filters = {
        conductor: { [Op.ne]: documento },
        estado: 'ACTIVA',
        asientosIda: { [Op.gt]: 0 },
        fecha: { [Op.gt]: fechaParaFiltrar },
    };
    if (pago.length > 0) {
        filters.pagoAceptado = { 
            [Op.or]: pago.map(p => ({ [Op.like]: `%${p}%` })) 
        };
    }
    try {
        const data = await compartidoViajeActivoModels.findAll({
            where: filters,
            include: [
                {
                    model: Usuario,
                    attributes: ['usu_documento', 'usu_nombre', 'usu_viajes', 'usu_calificacion'],
                },
                {
                    model: Vehiculo,
                    attributes: ['tipo', 'placa'],
                    where: transporte.length > 0 ? {
                        tipo: { [Op.in]: transporte } 
                    } : undefined
                },
                {
                    model: Solicitud,
                    as: 'viajeSolicitado',
                    attributes: ['idSolicitante', 'estadoSolicitud'],
                    where: {
                        estadoSolicitud: { [Op.not]: 'CANCELADA' },
                    },
                    required: false,
                },
            ],
        });
        let filteredData = data.filter(viaje => {
            if (viaje.viajeSolicitado.length === 0) {
                return true;
            } else {
                return !viaje.viajeSolicitado.some(solicitud => solicitud.idSolicitante === documento);
            }
        });
        if ((position1 && position1.lat && position1.lng) || (position2 && position2.lat && position2.lng)) {
            const filteredDataDistance = await Promise.all(filteredData.map(async (viaje) => {
                let firstPointDistance = Infinity;
                let secondPointDistance = Infinity;
                if (position1 && position1.lat && position1.lng && !(position1.lat === "" && position1.lng === "")) {
                    firstPointDistance = await calcularDistanciaPerpendicularPuntoRuta(position1, viaje.polilyne);
                }
                if (position2 && position2.lat && position2.lng && !(position2.lat === "" && position2.lng === "")) {
                    secondPointDistance = await calcularDistanciaPerpendicularPuntoRuta(position2, viaje.polilyne);
                }
                let viajeData = viaje.get();
                viajeData.distanciaPunto1 = firstPointDistance;
                viajeData.distanciaPunto2 = secondPointDistance;
                if ((firstPointDistance < 1 || firstPointDistance === Infinity) && (secondPointDistance < 1 || secondPointDistance === Infinity)) {
                    return viaje;
                }
                return null;
            }));

            // Filtrar los viajes nulos
            filteredData = filteredDataDistance.filter(viaje => viaje !== null);
        }

        const totalItems = filteredData.length;
        const paginatedData = filteredData.slice(offset, offset + limit);
        const totalPages = Math.ceil(totalItems / limit);
        res.send({
            data: paginatedData,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
            },
        });
    } catch (e) {
        // Manejo de errores
        httpError(res, `Error prestamos activos ${e}`);
    }
};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const _id = req.params._id;
    try {
        const data = await compartidoViajeActivoModels.update(
        objetoACambiar,
        {
            where: { _id: _id }
        })
        let actual = await compartidoViajeActivoModels.findOne({
            where: { _id: _id },
            include: [{
                model: Vehiculo
            }]
        });
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update compartidoViajeActivo"
            });
        }else{
            res.json({
                message: "Update compartidoViajeActivo failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOVIAJEACTIVO`);
    }
};

const deleteItem = async (req, res) => {
    try {
        const {_id} = req.params
        const data = await compartidoViajeActivoModels.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_COMPARTIDOVIAJEACTIVO")
    }
};


const getItemsByCompatidoViajesOrganization = async (req, res) => {
    req = matchedData(req)
    const { organizationId } = req
    try {
        const data = await compartidoViajeActivoModels.findAll({
            attributes : ['_id', 'lSalida', 'llegada', "fecha", "asientosIda", "asientosVuelta", "distancia", "duracionGoogle", "estado"],
            include : [{
                model : Usuario,
                attributes : ['usu_documento', 'usu_nombre'],
                include:[{
                    model: Empresa,
                    attributes: ['emp_id'],
                    where : {
                        emp_id : organizationId
                    }
                  }],
                  required: true
            },{
                model : Vehiculo,
                 attributes: ['tipo', 'marca', 'modelo', 'color', 'placa'],
            },{
                model : Comentarios,
                attributes : ['calificacion'],
                as: 'compartidoComentarios'
            },{
                model : Solicitud,
                attributes : ['idSolicitante'],
                where: {
                    estadoSolicitud: 'APROBADA'
                },
                required: false
            }]
        });

        const dataWithPassengers = data.map(viaje => {
            const viajeJson = viaje.toJSON();
            const pasajeros = viajeJson.compartidoSolicituds ? 
                viajeJson.compartidoSolicituds.map(sol => sol.idSolicitante).join(', ') : '';
            return {
                ...viajeJson,
                documentosPasajeros: pasajeros
            };
        });

        res.send({data: dataWithPassengers});
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM_COMPARTIDOVIAJEACTIVO ${error}`);
    }
};


module.exports = {
    getItems, getItemTripEnd, getItem, getItemPrestamoActivo, getItemPrestamoActivoConductor, getItemAllPrestamoActivosFiltered, getItemAllPrestamoActivosFilteredToAplication, getItemPrestamoActivoConductorProceso, getItemPrestamoActivoOrganizacion, getItemAllPrestamoActivos, createItem, updateItem, patchItem, deleteItem, getItemsFilterOrganization,getItemsByCompatidoViajesOrganization 
}
