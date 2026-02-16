const { matchedData } = require('express-validator');
const { tokenMsnModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Empresa = require('../models/mysql/empresa');
const Usuario = require('../models/mysql/usuario');
const TokenMsn = require('../models/mysql/tokenMsn');
const Prestamos = require('../models/mysql/prestamos');

const admin = require('../config/firebase');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');


const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await tokenMsnModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_TOKEN_MSN");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {_id} = req
        const data = await tokenMsnModels.findByPk(_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_TOKEN_MSN")
    }
};

const getItemDocument = async (req, res) => {
    try {
        req = matchedData(req)
        const { documento } = req
        const data = await tokenMsnModels.findAll({
            where:  {
                documento: documento
            }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_TOKEN_MSN")
    }
};

const getItemEmail = async (req, res) => {
    try {
        req = matchedData(req)
        const { email } = req
        const data = await tokenMsnModels.findAll({
            where:  {
                email: email
            }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_TOKEN_MSN")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await tokenMsnModels.create(body)
        res.send('Item Create Complete')
    } catch (error) {
        httpError(res, "ERROR_CREATE_TOKEN_MSN")
    }

};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const _id = req.params._id;
    try {
        const data = await tokenMsnModels.update(
        objetoACambiar,
        {
            where: { _id: _id }
        })
        let actual = await tokenMsnModels.findByPk(_id);
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update TOKEN_MSN"
            });
        }else{
            res.json({
                message: "Update TOKEN_MSN failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_TOKEN_MSN `);
    }
};

const deleteItem = async (req, res) => {
    try {
        const {_id} = req.params
        const data = await tokenMsnModels.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_TOKEN_MSN")
    }
};

const getNotificationUsersByOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    
    const empresa = await Empresa.findOne({
      where: { emp_id: organizationId }
    });
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    
    const users = await TokenMsn.findAll({
      include: [{
        model: Usuario,
        where: { usu_empresa: empresa.emp_nombre },
        attributes: ['usu_nombre', 'usu_ciudad', 'usu_empresa', 'usu_dir_trabajo', 'usu_habilitado'],
        as: 'bc_usuario'
      }],
      attributes: ['documento', 'email', 'token']
    });
    
    const userDocumentos = users.map(u => u.documento);
    
    const prestamosActivos = await Prestamos.findAll({
      where: {
        pre_usuario: { [Op.in]: userDocumentos },
        pre_estado: 'activo'
      },
      attributes: ['pre_usuario'],
      group: ['pre_usuario']
    });
    
    const usuariosConPrestamos = new Set(prestamosActivos.map(p => p.pre_usuario));
    
    const formattedUsers = users.map(user => ({
      documento: user.documento,
      email: user.email,
      token: user.token,
      usu_nombre: user.bc_usuario ? user.bc_usuario.usu_nombre : '',
      usu_ciudad: user.bc_usuario ? user.bc_usuario.usu_ciudad : '',
      usu_empresa: user.bc_usuario ? user.bc_usuario.usu_empresa : '',
      usu_estacion: user.bc_usuario ? user.bc_usuario.usu_dir_trabajo : '',
      usu_habilitado: user.bc_usuario ? user.bc_usuario.usu_habilitado : null,
      tiene_prestamos_activos: usuariosConPrestamos.has(user.documento)
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    httpError(res, "ERROR_GET_NOTIFICATION_USERS");
  }
};


const sendNotificationMessage = async (req, res) => {
  const fs = require('fs');
  const path = require('path');

  const firmaPath = path.join(__dirname, '../assets/firma_milena.jpg');
  const firmaBase64 = fs.readFileSync(firmaPath).toString('base64');

  try {
    const { users, messageType, message, subject, sendToType, organizationId, imageUrl } = req.body;
    
    if (imageUrl && imageUrl.length > 100000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Imagen demasiado grande. Máximo 100KB permitido.' 
      });
    }
    
    let targetUsers = [];
    
    if (sendToType === 'all') {
      const empresa = await Empresa.findOne({
        where: { emp_id: organizationId }
      });
      
      if (!empresa) {
        console.log('ERROR: Empresa no encontrada');
        return res.status(404).json({ error: 'Empresa no encontrada' });
      }
      
      targetUsers = await TokenMsn.findAll({
        include: [{
          model: Usuario,
          where: { usu_empresa: empresa.emp_nombre },
          attributes: ['usu_nombre'],
          as: 'bc_usuario'
        }],
        attributes: ['documento', 'email', 'token']
      });
    } else {
      targetUsers = await TokenMsn.findAll({
        where: { documento: { [Op.in]: users } },
        include: [{
          model: Usuario,
          attributes: ['usu_nombre'],
          as: 'bc_usuario'
        }],
        attributes: ['documento', 'email', 'token']
      });
    }
    
    
    if (targetUsers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se encontraron usuarios para enviar el mensaje' 
      });
    }
    
    const emailResults = [];
    const pushResults = [];
    
    for (const user of targetUsers) {
      
    if (['email', 'email-push', 'email-in-app', 'all'].includes(messageType)) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'Servicio@bicyclecapital.co',
            pass: 'fyam ecci wqby fhaj'
          }
        });
        
        let emailOptions = { 
          from: 'Servicio@bicyclecapital.co',
          to: user.email,
          subject: subject,
          text: message
        };
        
        if (imageUrl && imageUrl.startsWith('data:image')) {
          emailOptions.attachments = [
            {
              filename: 'imagen.jpg',
              content: imageUrl.split(',')[1],
              encoding: 'base64',
              cid: 'imagen'
            },
            {
              filename: 'firma.png',
              content: firmaBase64,
              encoding: 'base64',
              cid: 'firma'
            }
          ];
          emailOptions.html = `<p>${message}</p><img src="cid:imagen" style="max-width: 200px;"><br><br><img src="cid:firma" style="max-width: 400px; width: 100%;">`;
        } else if (imageUrl) {
          emailOptions.attachments = [{
            filename: 'firma.png',
            content: firmaBase64,
            encoding: 'base64',
            cid: 'firma'
          }];
          emailOptions.html = `<p>${message}</p><img src="${imageUrl}" style="max-width: 200px;"><br><br><img src="cid:firma" style="max-width: 400px; width: 100%;">`;
        } else {
          emailOptions.attachments = [{
            filename: 'firma.png',
            content: firmaBase64,
            encoding: 'base64',
            cid: 'firma'
          }];
          emailOptions.html = `<p>${message}</p><br><br><img src="cid:firma" style="max-width: 400px; width: 100%;">`;
        }
        
        await transporter.sendMail(emailOptions);
        emailResults.push({ documento: user.documento, success: true, type: 'email' });
      } catch (emailError) {
        emailResults.push({ documento: user.documento, success: false, type: 'email', error: emailError.message });
      }
    }
      
      if (['push', 'email-push', 'in-app', 'push-in-app', 'email-in-app', 'all'].includes(messageType)) {
        
        if (user.token && user.token.trim() !== '' && user.token.length > 140) {
          try {
            const messageId = `msg_${Date.now()}_${user.documento}`;
            
    const pushMessage = {
  token: user.token,
  notification: {
    title: subject || 'Notificación',
    body: message || 'Mensaje'
  },
  android: {
    priority: 'high',
    notification: {
      sound: 'default',
      channelId: 'high_importance_channel'
    },
    data: {
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
      messageType: messageType,
      messageId: messageId,
      isInApp: ['in-app', 'push-in-app', 'email-in-app', 'all'].includes(messageType).toString()
    }
  },
  apns: {
    headers: {
      'apns-priority': '10',
      'apns-push-type': 'alert'
    },
    payload: {
      aps: {
        alert: {
          title: subject || 'Notificación',
          body: message || 'Mensaje'
        },
        sound: 'default',
        badge: 1,
        contentAvailable: true
      }
    }
  },
  data: {
    messageType: messageType,
    messageId: messageId,
    isInApp: ['in-app', 'push-in-app', 'email-in-app', 'all'].includes(messageType).toString(),
    timestamp: Date.now().toString()
  }
    } 
                
            const pushResponse = await admin.messaging().send(pushMessage);
            pushResults.push({ 
              documento: user.documento, 
              success: true, 
              type: 'push',
              messageId: pushResponse
            });
            
          } catch (pushError) {
            
            if (pushError.code === 'messaging/registration-token-not-registered' || 
                pushError.code === 'messaging/invalid-registration-token') {
              try {
                await TokenMsn.update(
                  { token: null },
                  { where: { documento: user.documento } }
                );
              } catch (updateError) {
                console.log('Error limpiando token:', updateError.message);
              }
            }
            
            pushResults.push({ 
              documento: user.documento, 
              success: false, 
              type: 'push', 
              error: pushError.message,
              code: pushError.code || 'UNKNOWN_ERROR'
            });
          }
          
        } else {
          const reason = !user.token ? 'Token no disponible' : 
                        user.token.trim() === '' ? 'Token vacío' : 
                        'Token muy corto (inválido)';
          
          pushResults.push({ 
            documento: user.documento, 
            success: false, 
            type: 'push', 
            error: reason
          });
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const allResults = [...emailResults, ...pushResults];
    const successCount = allResults.filter(r => r.success).length;
    const failCount = allResults.filter(r => !r.success).length;
    
    res.json({ 
      success: true, 
      results: allResults,
      summary: {
        totalUsers: targetUsers.length,
        totalSent: successCount,
        totalFailed: failCount,
        emailsSent: emailResults.filter(r => r.success).length,
        pushSent: pushResults.filter(r => r.success).length,
        failedPush: pushResults.filter(r => !r.success).length
      }
    });
    
  } catch (error) {
    console.log('ERROR GENERAL:', error.message);
    console.log('Stack trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
    getItems, getItem, createItem, patchItem, deleteItem, getItemDocument, getItemEmail, getNotificationUsersByOrganization, sendNotificationMessage
}
