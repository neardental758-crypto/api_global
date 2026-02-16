const { matchedData } = require('express-validator');
const { puntosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Usuario = require('../models/mysql/usuario');
const _id_cortezza = '627a8c9931feb31c33377d0e';
const nombre_cortezza = 'Cortezza MDN';
const nodemailer = require("nodemailer");

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await puntosModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_PUNTOS");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {pun_id} = req
        const data = await puntosModels.findByPk(pun_idv);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PUNTOS")
    }
};


const getItemUsuario = async (req, res) => {
    try {
        req = matchedData(req)
        const { pun_usuario } = req
        const data = await puntosModels.findAll({ where: { pun_usuario: pun_usuario }});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_BICI_PUNTOS_USUARIO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await puntosModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_PUNTOS")
    }
};

const updateItem = async (req, res) => {};

const deleteItem = (req, res) => {};

const getItemUsuario_cortezza = async (req, res) => {
    try {
        req = matchedData(req)
        const { pun_usuario } = req
        const data = await puntosModels.findAll({ 
            where: { 
                pun_usuario: pun_usuario 
            },
            include:[{
                model: Usuario,
                where: { 
                    usu_empresa: nombre_cortezza
                }
            }]
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_BICI_PUNTOS_USUARIO")
    }
};

const MAIL_USER = 'Servicio@bicyclecapital.co'; 
const MAIL_PASS = 'fyam ecci wqby fhaj';

const correo__recompensas = async (req, res) => {
  try {
    const { email, data } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });

    await transporter.sendMail({
        from: `"Soporte RIDE" <${MAIL_USER}>`,
        to: email,
        subject: "Tu recompensa en RIDE",
        html: `
            <p>Hola,</p>
            <p>¡Felicidades! Has obtenido una recompensa en RIDE.</p>
            <p>Tu recompensa es: <strong>${data}</strong></p>
            <p>Nuestro equipo de soporte se pondrá en contacto contigo para completar el proceso.</p>
            <br>
            <p>Gracias por ser parte de RIDE 🚴‍♂️</p>
        `,
    });

    await transporter.sendMail({
        from: `"Recompensas RIDE" <${MAIL_USER}>`,
        to: MAIL_USER,
        subject: "Nuevo caso: Recompensa pendiente",
        html: `
            <h3>Recompensa pendiente</h3>
            <p>Se ha registrado un nuevo caso de recompensa:</p>
            <ul>
            <li><strong>Email del usuario:</strong> ${email}</li>
            <li><strong>Recompensa:</strong> ${data}</li>
            </ul>
            <p>Por favor, comunícate con el usuario para gestionar la entrega.</p>
            <br>
            <p>-- Sistema de Recompensas RIDE</p>
        `,
    });

    return res.json({ message: "Contraseña temporal enviada al correo." });
  } catch (error) {
    console.error("Error en correo__password:", error);
    return res.status(500).json({ error: "Error al enviar correo" });
  }
};

const getRecompensasByEmpresa = async (req, res) => {
    try {
        req = matchedData(req);
        const { empresa } = req;
        
        if (!empresa) {
            return res.status(400).send({ error: "Empresa no proporcionada" });
        }
        
        const data = await puntosModels.findAll({
            where: {
                pun_modulo: ['RECOMPENSAS_PENDIENTE', 'RECOMPENSAS_FINALIZADO']
            },
            include: [{
                model: Usuario,
                as: 'bc_usuario',
                where: {
                    usu_empresa: empresa
                },
                attributes: ['usu_documento', 'usu_nombre']
            }]
        });
        
        const formattedData = data.map(item => ({
            pun_id: item.pun_id,
            usuario_documento: item.bc_usuario.usu_documento,
            usuario_nombre: item.bc_usuario.usu_nombre,
            fecha: item.pun_fecha,
            puntos: item.pun_puntos,
            motivo: item.pun_motivo,
            estado: item.pun_modulo
        }));
        
        res.send({ data: formattedData });
    } catch (e) {
        console.error(e);
        httpError(res, "ERROR_GET_RECOMPENSAS_EMPRESA");
    }
};

const updateEstadoRecompensa = async (req, res) => {
    try {
        const { pun_id, estado } = req.body;
        
        await puntosModels.update(
            { pun_modulo: estado },
            { where: { pun_id: pun_id } }
        );
        
        res.send({ message: 'Estado actualizado correctamente' });
    } catch (e) {
        console.error(e);
        httpError(res, "ERROR_UPDATE_RECOMPENSA");
    }
};

module.exports = {
    getItems, getItem, getItemUsuario, createItem, updateItem, deleteItem, getItemUsuario_cortezza, correo__recompensas, getRecompensasByEmpresa, updateEstadoRecompensa
}
