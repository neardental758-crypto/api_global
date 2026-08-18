const { matchedData } = require('express-validator');
const { tokenMsnModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Empresa = require('../models/mysql/empresa');
const Usuario = require('../models/mysql/usuario');
const TokenMsn = require('../models/mysql/tokenMsn');
const Prestamos = require('../models/mysql/prestamos');
const HistorialNotificaciones = require('../models/mysql/historialNotificaciones');
const NotificacionesProgramadas = require('../models/mysql/notificacionesProgramadas');

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
    
    const users = await Usuario.findAll({
      where: { usu_empresa: empresa.emp_nombre },
      attributes: ['usu_documento', 'usu_nombre', 'usu_email', 'usu_ciudad', 'usu_empresa', 'usu_dir_trabajo', 'usu_habilitado'],
      include: [{
        model: TokenMsn,
        attributes: ['token', 'email'],
        as: 'token_info',
        required: false
      }]
    });

    const userDocumentos = users.map(u => u.usu_documento).filter(Boolean);

    let usuariosConPrestamos = new Set();
    let usuariosConPrestamosPersonalizados = new Set();

    if (userDocumentos.length > 0) {
      const estadosPrestamoActivo = ['ACTIVA', 'PRESTAMO DE EMERGENCIA'];
      
      const prestamosActivos = await Prestamos.findAll({
        where: {
          pre_usuario: { [Op.in]: userDocumentos },
          [Op.and]: [
            { pre_estado: { [Op.ne]: null } },
            {
              [Op.or]: [
                { pre_estado: { [Op.in]: estadosPrestamoActivo } },
                {
                  pre_estado: {
                    [Op.in]: estadosPrestamoActivo.map((e) => e.toLowerCase()),
                  },
                },
              ],
            },
          ],
        },
        attributes: ['pre_usuario'],
        group: ['pre_usuario']
      });

      const estadosPrestamoPersonalizado = ['PRESTAMO PERSONALIZADO'];
      
      const prestamosPersonalizados = await Prestamos.findAll({
        where: {
          pre_usuario: { [Op.in]: userDocumentos },
          [Op.and]: [
            { pre_estado: { [Op.ne]: null } },
            {
              [Op.or]: [
                { pre_estado: { [Op.in]: estadosPrestamoPersonalizado } },
                {
                  pre_estado: {
                    [Op.in]: estadosPrestamoPersonalizado.map((e) => e.toLowerCase()),
                  },
                },
              ],
            },
          ],
        },
        attributes: ['pre_usuario'],
        group: ['pre_usuario']
      });

      usuariosConPrestamos = new Set(prestamosActivos.map(p => p.pre_usuario));
      usuariosConPrestamosPersonalizados = new Set(prestamosPersonalizados.map(p => p.pre_usuario));
    }

    const formattedUsers = users.map(user => ({
      documento: user.usu_documento,
      email: user.usu_email || (user.token_info ? user.token_info.email : ''),
      token: user.token_info ? user.token_info.token : null,
      usu_nombre: user.usu_nombre || '',
      usu_ciudad: user.usu_ciudad || '',
      usu_empresa: user.usu_empresa || '',
      usu_estacion: user.usu_dir_trabajo || '',
      usu_habilitado: user.usu_habilitado,
      tiene_prestamos_activos: usuariosConPrestamos.has(user.usu_documento),
      tiene_prestamos_personalizados: usuariosConPrestamosPersonalizados.has(user.usu_documento)
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

  let firmaBase64 = '';
  try {
    const firmaPath = path.join(__dirname, '../assets/firma_milena.jpg');
    if (fs.existsSync(firmaPath)) {
      firmaBase64 = fs.readFileSync(firmaPath).toString('base64');
    }
  } catch (e) {
    console.warn('Firma no disponible:', e.message);
  }

  try {
    const { users, messageType, message, subject, sendToType, organizationId, imageUrl } = req.body;
    
    if (imageUrl && imageUrl.startsWith('data:') && imageUrl.length > 5000000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Imagen demasiado grande. Máximo 5MB permitido.' 
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
      
      const dbUsers = await Usuario.findAll({
        where: { usu_empresa: empresa.emp_nombre },
        attributes: ['usu_documento', 'usu_nombre', 'usu_email'],
        include: [{
          model: TokenMsn,
          attributes: ['token', 'email'],
          as: 'token_info',
          required: false
        }]
      });

      targetUsers = dbUsers.map(u => ({
        documento: u.usu_documento,
        email: u.usu_email || (u.token_info ? u.token_info.email : ''),
        token: u.token_info ? u.token_info.token : null,
        bc_usuario: { usu_nombre: u.usu_nombre }
      }));
    } else {
      const dbUsers = await Usuario.findAll({
        where: { usu_documento: { [Op.in]: users } },
        attributes: ['usu_documento', 'usu_nombre', 'usu_email'],
        include: [{
          model: TokenMsn,
          attributes: ['token', 'email'],
          as: 'token_info',
          required: false
        }]
      });

      targetUsers = dbUsers.map(u => ({
        documento: u.usu_documento,
        email: u.usu_email || (u.token_info ? u.token_info.email : ''),
        token: u.token_info ? u.token_info.token : null,
        bc_usuario: { usu_nombre: u.usu_nombre }
      }));
    }
    
    
    if (targetUsers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se encontraron usuarios para enviar el mensaje' 
      });
    }
    
    const emailResults = [];
    const pushResults = [];
    
    const mailUser = process.env.MAIL_USER || 'contacto@bicyclecapital.co';
    const mailPass = process.env.MAIL_PASS || 'cfgp eoer gfsk xsfm';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailPass
      }
    });

    for (const user of targetUsers) {
      
    if (['email', 'email-push', 'email-in-app', 'all'].includes(messageType)) {
      try {
        if (!user.email || user.email.trim() === '') {
          throw new Error('Usuario sin correo electrónico registrado');
        }

        let emailOptions = { 
          from: `"Bicycle Capital" <${mailUser}>`,
          to: user.email,
          subject: subject,
          text: message
        };
        
        if (imageUrl && imageUrl.startsWith('data:image')) {
          const attachments = [
            {
              filename: 'imagen.jpg',
              content: imageUrl.split(',')[1],
              encoding: 'base64',
              cid: 'imagen'
            }
          ];
          if (firmaBase64) {
            attachments.push({
              filename: 'firma.png',
              content: firmaBase64,
              encoding: 'base64',
              cid: 'firma'
            });
          }
          emailOptions.attachments = attachments;
          emailOptions.html = `<p>${message}</p><img src="cid:imagen" style="max-width: 200px;"><br><br>${firmaBase64 ? '<img src="cid:firma" style="max-width: 400px; width: 100%;">' : ''}`;
        } else if (imageUrl) {
          if (firmaBase64) {
            emailOptions.attachments = [{
              filename: 'firma.png',
              content: firmaBase64,
              encoding: 'base64',
              cid: 'firma'
            }];
          }
          emailOptions.html = `<p>${message}</p><img src="${imageUrl}" style="max-width: 200px;"><br><br>${firmaBase64 ? '<img src="cid:firma" style="max-width: 400px; width: 100%;">' : ''}`;
        } else {
          if (firmaBase64) {
            emailOptions.attachments = [{
              filename: 'firma.png',
              content: firmaBase64,
              encoding: 'base64',
              cid: 'firma'
            }];
            emailOptions.html = `<p>${message}</p><br><br><img src="cid:firma" style="max-width: 400px; width: 100%;">`;
          } else {
            emailOptions.html = `<p>${message}</p>`;
          }
        }
        
        await transporter.sendMail(emailOptions);
        console.log(`✉️ Email enviado con éxito a: ${user.email}`);
        emailResults.push({ documento: user.documento, success: true, type: 'email' });
      } catch (emailError) {
        console.error(`❌ Error enviando email a ${user.email}:`, emailError.message);
        emailResults.push({ documento: user.documento, success: false, type: 'email', error: emailError.message });
      }
    }
      
      if (['push', 'email-push', 'in-app', 'push-in-app', 'email-in-app', 'all'].includes(messageType)) {
        
        if (user.token && user.token.trim() !== '' && user.token.length > 140) {
          try {
            const messageId = `msg_${Date.now()}_${user.documento}`;
            const isHttpUrl = imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));
            
    const pushMessage = {
      token: user.token,
      notification: {
        title: subject || 'Notificación',
        body: message || 'Mensaje',
        ...(isHttpUrl ? { image: imageUrl } : {})
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
          ...(isHttpUrl ? { image: imageUrl } : {})
        },
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          messageType: messageType,
          messageId: messageId,
          isInApp: ['in-app', 'push-in-app', 'email-in-app', 'all'].includes(messageType).toString(),
          ...(isHttpUrl ? { imageUrl: imageUrl } : {})
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
        },
        fcmOptions: {
          ...(isHttpUrl ? { image: imageUrl } : {})
        }
      },
      data: {
        messageType: messageType,
        messageId: messageId,
        isInApp: ['in-app', 'push-in-app', 'email-in-app', 'all'].includes(messageType).toString(),
        timestamp: Date.now().toString(),
        ...(isHttpUrl ? { imageUrl: imageUrl } : {})
      }
    }; 
                
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

    // Guardar en el historial de la base de datos
    try {
      const recipientList = targetUsers.map(u => u.email || u.documento);
      await HistorialNotificaciones.create({
        hnot_remitente: req.body.remitente || 'Sistema',
        hnot_organizacion_id: organizationId,
        hnot_titulo: subject || 'Notificación',
        hnot_mensaje: message || '',
        hnot_tipo_mensaje: messageType,
        hnot_destinatarios: JSON.stringify(recipientList),
        hnot_destinatarios_conteo: targetUsers.length,
        hnot_exitosas: successCount,
        hnot_fallidas: failCount,
        hnot_fecha_envio: new Date()
      });
      console.log('✅ Historial de notificación guardado en DB.');
    } catch (dbError) {
      console.error('❌ Error al guardar el historial en DB:', dbError);
    }
    
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

const getNotificationHistory = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { startDate, endDate, search, messageType } = req.query;

    const whereClause = {
      hnot_organizacion_id: organizationId
    };

    // Filtro de rango de fechas
    if (startDate || endDate) {
      whereClause.hnot_fecha_envio = {};
      if (startDate) {
        whereClause.hnot_fecha_envio[Op.gte] = new Date(startDate + 'T00:00:00');
      }
      if (endDate) {
        whereClause.hnot_fecha_envio[Op.lte] = new Date(endDate + 'T23:59:59');
      }
    }

    // Filtro por tipo de mensaje
    if (messageType && messageType !== 'all') {
      whereClause.hnot_tipo_mensaje = messageType;
    }

    // Búsqueda general en título, mensaje o remitente
    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { hnot_titulo: { [Op.like]: searchPattern } },
        { hnot_mensaje: { [Op.like]: searchPattern } },
        { hnot_remitente: { [Op.like]: searchPattern } }
      ];
    }

    const data = await HistorialNotificaciones.findAll({
      where: whereClause,
      order: [['hnot_fecha_envio', 'DESC']]
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    httpError(res, "ERROR_GET_NOTIFICATION_HISTORY");
  }
};

const createScheduledNotification = async (req, res) => {
  try {
    const { 
      organizationId, remitente, titulo, mensaje, tipo_mensaje,
      destinatarios, send_to_type, selected_estacion, filter_type,
      es_recurrente, fecha, hora, dia_semana, imageUrl
    } = req.body;

    const data = await NotificacionesProgramadas.create({
      prog_organizacion_id: organizationId,
      prog_remitente: remitente || 'Sistema',
      prog_titulo: titulo || 'Notificación Programada',
      prog_mensaje: mensaje || '',
      prog_tipo_mensaje: tipo_mensaje || 'all',
      prog_destinatarios: JSON.stringify(destinatarios || []),
      prog_send_to_type: send_to_type || 'selected',
      prog_selected_estacion: selected_estacion || '',
      prog_filter_type: filter_type || 'all',
      prog_image_url: imageUrl || '',
      prog_es_recurrente: es_recurrente || false,
      prog_fecha: fecha || '',
      prog_hora: hora || '',
      prog_dia_semana: Array.isArray(dia_semana) ? dia_semana.join(',') : (dia_semana || ''),
      prog_estado: 'PENDIENTE',
      prog_fecha_creacion: new Date()
    });

    res.json({ success: true, message: 'Notificación programada exitosamente', data });
  } catch (error) {
    console.error('Error creating scheduled notification:', error);
    httpError(res, "ERROR_CREATE_SCHEDULED_NOTIFICATION");
  }
};

const getScheduledNotifications = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const data = await NotificacionesProgramadas.findAll({
      where: {
        prog_organizacion_id: organizationId,
        prog_estado: 'PENDIENTE'
      },
      order: [['prog_fecha_creacion', 'DESC']]
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching scheduled notifications:', error);
    httpError(res, "ERROR_GET_SCHEDULED_NOTIFICATIONS");
  }
};

const deleteScheduledNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await NotificacionesProgramadas.destroy({
      where: { prog_id: id }
    });

    res.json({ success: true, message: 'Notificación programada cancelada correctamente' });
  } catch (error) {
    console.error('Error deleting scheduled notification:', error);
    httpError(res, "ERROR_DELETE_SCHEDULED_NOTIFICATION");
  }
};

module.exports = {
    getItems, getItem, createItem, patchItem, deleteItem, getItemDocument, getItemEmail, getNotificationUsersByOrganization, sendNotificationMessage, getNotificationHistory, createScheduledNotification, getScheduledNotifications, deleteScheduledNotification
}
