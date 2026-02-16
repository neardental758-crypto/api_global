const { matchedData } = require('express-validator');
const { reservasParqueoModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');
const Lugares = require('../models/mysql/parqueo_lugar');
const Estacion = require('../models/mysql/estacion');

const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await reservasParqueoModels.findAll({
        });
        res.send({data});
    } catch (error) {
        console.error("🔥 ERROR REAL:", error);
        httpError(res, "ERROR_GET_ITEM_RESERVAS_PARQUEO");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await reservasParqueoModels.findByPk(id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_USER")
    }
};

const getItemUsuario = async (req, res) => {
    try {
        req = matchedData(req)
        const { usuario } = req
        const data = await reservasParqueoModels.findAll({ where: { usuario: usuario, estado: 'ACTIVA' }});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_RESERVAS_USUARIO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        console.log("🚀 ~ file: parqueo_reservas.js:42 ~ createItem ~ body:", body)
        const data = await reservasParqueoModels.create(body)
        console.log("Reserva creada:", data);
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_CREATE_RESERVA_PARQUEO");
    }

};

const temporizador = async (req, res) => {
  try {
    const { duracion, lugar, usuario } = req.body;

    console.log(`⏳ Temporizador iniciado para reserva del usuario ${usuario}, con duración: ${duracion} minutos en el lugar ${lugar}`);

    // Enviar respuesta inmediata para no mantener esperando al frontend
    res.send({ ok: true, message: "Temporizador iniciado" });

    const minutosDuracion = parseInt(duracion, 10);

    // Ejecutar cancelación automática tras el tiempo indicado
    setTimeout(async () => {
      try {
        // Verificar si la reserva sigue activa antes de cancelar
        const reserva = await reservasParqueoModels.findOne({ where: {
            usuario: usuario,
            estado: 'ACTIVA'
        }});

        console.log(`⏰ Verificando reserva para cancelación automática...`, reserva);

        if (reserva) {
          await reservasParqueoModels.update(
            { estado: 'CANCELADA' },
            { 
                where: { 
                    usuario: usuario,
                    estado: 'ACTIVA'
                }
            }
          );
          console.log(`❌ Reserva de usuario ${usuario} cancelada automáticamente por tiempo expirado`);

          await Lugares.update(
            { estado: 'DISPONIBLE' },
            { where: { id: lugar }}
          );
          console.log(`❌ La bicicleta ${lugar} está disponible nuevamente tras la cancelación de la reserva`);

        } else {
          console.log(`✅ Reserva de usuario ${usuario} ya no estaba activa al momento del timeout`);
        }

      } catch (err) {
        console.error("❗ Error al cancelar reserva en temporizador:", err);
      }
    }, minutosDuracion * 60 * 1000); // convertir a milisegundos

  } catch (error) {
    console.error("❗ ERROR en temporizador:", error);
    httpError(res, "ERROR_TEMPORIZADOR");
  }
};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await reservasParqueoModels.update(
            {
                estado: body.estado,
            },
            {
                where: { id : body.id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_RESERVA");
    }
};

const updateItemVehiculo = async (req, res) => {
    try {
        const { body } = req
        const data = await reservasParqueoModels.update(
            {
                lugar_parqueo : body.lugar,
            },
            {
                where: { id : body.id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_VEHICULO_RESERVA");
    }
};

const updateEstadoReserva = async (req, res) => {
    try {
        const id = req.params.id;
        const { estado } = req.body;
        
        const data = await reservasParqueoModels.update(
            { estado },
            { where: { id } }
        );
 
        if (data[0] > 0) {
            res.status(200).json({
                status: 200, 
                data: { estado },
                message: "Estado de reserva actualizado"
            });
        } else {
            res.status(404).json({
                message: "Reserva no encontrada o no se pudo actualizar"
            });
        }
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_RESERVA");
    }
 };

const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, getItemUsuario, createItem, updateItem, deleteItem, updateItemVehiculo, updateEstadoReserva, temporizador
}
