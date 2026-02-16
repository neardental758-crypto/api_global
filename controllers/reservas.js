const { matchedData } = require('express-validator');
const { reservasModels , bicicletasModels} = require('../models');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');
const Bicicleta = require('../models/mysql/bicicletas');
const Estacion = require('../models/mysql/estacion');
const _id_cortezza = '627a8c9931feb31c33377d0e';
const nombre_cortezza = 'Cortezza MDN';
const Bicicletero = require('../models/mysql/bicicleteros');
const { Sequelize } = require('sequelize');

const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await reservasModels.findAll({
            include:[{
                model: Bicicleta,
                attributes: ['bic_numero'],
              },
              {
                model: Usuario,
                include:[{
                    model: Empresa
                 }]
             }],
             order: [
                ['res_id', 'DESC']
            ]
        });
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_RESERVAS");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {res_id} = req
        const data = await reservasModels.findByPk(res_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_USER")
    }
};

const getItemUsuario = async (req, res) => {
    try {
        req = matchedData(req)
        const { res_usuario } = req
        const data = await reservasModels.findAll({ where: { res_usuario: res_usuario, res_estado: 'ACTIVA' }});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_RESERVAS_USUARIO")
    }
};

/*const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await reservasModels.create(body)
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_CREATE_RESERVA")
    }
};*/

const createItem = async (req, res) => {
    try {
        const { body } = req;

        const sumarHoras = (hora, horasASumar) => {
            if (!hora) {
                return new Date().toTimeString().substring(0, 8);
            }
            
            let horaString = hora;
            if (typeof hora !== 'string') {
                if (hora instanceof Date) {
                    horaString = hora.toTimeString().substring(0, 8);
                } else {
                    horaString = String(hora);
                }
            }
            
            let partes = horaString.split(":");
            if (partes.length < 3) {
                partes = [...partes, '00', '00'];
            }
            
            let fecha = new Date();
            fecha.setHours(parseInt(partes[0]) || 0);
            fecha.setMinutes(parseInt(partes[1]) || 0);
            fecha.setSeconds(parseInt(partes[2]) || 0);
            
            fecha.setHours(fecha.getHours() + horasASumar);
            
            return fecha.toTimeString().substring(0, 8);
        };

        if (!body.res_hora_inicio || !body.res_hora_fin) {
            return httpError(res, "MISSING_TIME_FIELDS", 400);
        }

        body.res_hora_inicio = sumarHoras(body.res_hora_inicio, 5);
        body.res_hora_fin = sumarHoras(body.res_hora_fin, 5);

        const data = await reservasModels.create(body);
        res.send('ok');
    } catch (error) {
        console.error(error);
        httpError(res, "ERROR_CREATE_RESERVA");
    }
};

const getReservas4G = async (req, res) => {
    try {
        const { emp_id } = req.params;
        
        const empresa = await Empresa.findOne({
            where: { emp_id: emp_id }
        });
        
        if (!empresa) {
            return httpError(res, "EMPRESA_NOT_FOUND", 404);
        }

        const reservas = await reservasModels.findAll({
            include: [
                {
                    model: Bicicleta,
                    attributes: ['bic_numero', 'bic_id'],
                    required: true,
                    include: [{
                        model: Bicicletero,
                        required: true,
                        where: {
                            [Sequelize.Op.or]: [
                                {
                                    bro_bluetooth: {
                                        [Sequelize.Op.regexp]: '^([0-9A-F]{2}:){5}[0-9A-F]{2}$'
                                    }
                                },
                                {
                                    bro_clave: {
                                        [Sequelize.Op.regexp]: '^[A-Za-z]$'
                                    }
                                }
                            ]
                        }
                    }]
                },
                {
                    model: Usuario,
                    required: true,
                    where: { usu_empresa: empresa.emp_nombre },
                    include: [{ model: Empresa }]
                }
            ],
            order: [['res_id', 'DESC']]
        });

        res.send({ data: reservas });
    } catch (error) {
        console.error(error);
        httpError(res, "ERROR_GET_RESERVAS_4G");
    }
};

const getReservas3G = async (req, res) => {
    try {
        const { emp_id } = req.params;
        
        const empresa = await Empresa.findOne({
            where: { emp_id: emp_id }
        });
        
        if (!empresa) {
            return httpError(res, "EMPRESA_NOT_FOUND", 404);
        }

        const reservas = await reservasModels.findAll({
            include: [
                {
                    model: Bicicleta,
                    attributes: ['bic_numero', 'bic_id'],
                    required: true,
                    include: [{
                        model: Bicicletero,
                        required: true,
                        where: {
                            [Sequelize.Op.and]: [
                                {
                                    [Sequelize.Op.or]: [
                                        { bro_bluetooth: null },
                                        {
                                            bro_bluetooth: {
                                                [Sequelize.Op.notRegexp]: '^([0-9A-F]{2}:){5}[0-9A-F]{2}$'
                                            }
                                        }
                                    ]
                                },
                                {
                                    [Sequelize.Op.or]: [
                                        { bro_clave: null },
                                        {
                                            bro_clave: {
                                                [Sequelize.Op.notRegexp]: '^[A-Za-z]$'
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }]
                },
                {
                    model: Usuario,
                    required: true,
                    where: { usu_empresa: empresa.emp_nombre },
                    include: [{ model: Empresa }]
                }
            ],
            order: [['res_id', 'DESC']]
        });

        res.send({ data: reservas });
    } catch (error) {
        console.error(error);
        httpError(res, "ERROR_GET_RESERVAS_3G");
    }
};

const temporizador = async (req, res) => {
  try {
    const { duracion, bici, res_usuario } = req.body;

    console.log(`⏳ Temporizador iniciado para reserva del usuario ${res_usuario}, con duración: ${duracion} minutos y la bicicleta ${bici}`);

    // Enviar respuesta inmediata para no mantener esperando al frontend
    res.send({ ok: true, message: "Temporizador iniciado" });

    const minutosDuracion = parseInt(duracion, 10);

    // Ejecutar cancelación automática tras el tiempo indicado
    setTimeout(async () => {
      try {
        // Verificar si la reserva sigue activa antes de cancelar
        const reserva = await reservasModels.findOne({ where: {
            res_usuario: res_usuario,
            res_estado: 'ACTIVA'
        }});

        console.log(`⏰ Verificando reserva para cancelación automática...`, reserva);

        if (reserva) {
          await reservasModels.update(
            { res_estado: 'CANCELADA' },
            { 
                where: { 
                    res_usuario: res_usuario,
                    res_estado: 'ACTIVA'
                }
            }
          );
          console.log(`❌ Reserva de usuario ${res_usuario} cancelada automáticamente por tiempo expirado`);

          await Bicicleta.update(
            { bic_estado: 'DISPONIBLE' },
            { where: { bic_id: bici }}
          );
          console.log(`❌ La bicicleta ${bici} está disponible nuevamente tras la cancelación de la reserva`);

        } else {
          console.log(`✅ Reserva de usuriopa ${res_usuario} ya no estaba activa al momento del timeout`);
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
        
        const reserva = await reservasModels.findOne({
            where: { res_id: body.res_id }
        });
        
        const data = await reservasModels.update(
            {
                res_estado: body.estado,
            },
            {
                where: { res_id : body.res_id },
            }
        )
        
        if (body.estado === "CANCELADA" && reserva) {
            await bicicletasModels.update(
                {
                    bic_estado: "DISPONIBLE",
                },
                {
                    where: { bic_id: reserva.res_bicicleta },
                }
            );
        }
        
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_RESERVA");
    }
};

const updateItemVehiculo = async (req, res) => {
    try {
        const { body } = req
        const data = await reservasModels.update(
            {
                res_bicicleta : body.res_bicicleta,
            },
            {
                where: { res_id : body.res_id },
            }
        )
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_VEHICULO_RESERVA");
    }
};

const updateEstadoReserva = async (req, res) => {
    try {
        const res_id = req.params.res_id;
        const { res_estado } = req.body;
        
        const data = await reservasModels.update(
            { res_estado },
            { where: { res_id } }
        );
 
        if (data[0] > 0) {
            res.status(200).json({
                status: 200, 
                data: { res_estado },
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

const getItem_cortezza = async (req, res) => {
    try {
        req = matchedData(req)
        const {res_id} = req
        const data = await reservasModels.findByPk(res_id, {
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
        httpError(res, "ERROR_GET_RESERVA_CORTZZA")
    }
};

const getItemUsuario_cortezza = async (req, res) => {
    try {
        req = matchedData(req)
        const { res_usuario } = req
        const data = await reservasModels.findAll({ 
            where: { 
                res_usuario: res_usuario, 
                res_estado: 'ACTIVA' 
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
        httpError(res, "ERROR_GET_RESERVAS_USUARIO")
    }
};

module.exports = {
    getItems, getItem, getItemUsuario, createItem, updateItem, deleteItem, updateItemVehiculo,
     getItem_cortezza, getItemUsuario_cortezza, updateEstadoReserva, temporizador,getReservas4G,getReservas3G
}
