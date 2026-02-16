const { matchedData } = require('express-validator');
const { agendamientoUsuariosModels, usuarioModels } = require('../models');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');
const Practica = require('../models/mysql/practicaActiva');
const Estacion = require('../models/mysql/estacion');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');


const getItems = async (req, res) => {
    const filtro = JSON.parse(req.query.filter);
    const organization = filtro.organizationId;
    try {
        const data = await agendamientoUsuariosModels.findAll({
            include: [
                {
                    model: Usuario,
                    attributes: ['usu_documento', 'usu_nombre'],
                    as: 'Agenda',
                    include:[{
                        model: Empresa,
                        attributes: ['emp_id'],
                        where : {
                            emp_id : organization
                        }
                      }],
                      required : true
                },{
                    model: Practica,
                    attributes: ['practica_cupos', 'practica_estacion', 'practica_fecha'],
                    as: 'Practica',
                    include:[{
                        model: Usuario,
                        attributes: ['usu_documento', 'usu_nombre'],
                        as: 'Funcionario',
                      }],
                }
            ]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, `ERROR_GET_AGENDAMIENTO_ACTIVO`);
    }
};

const getItem = async (req, res) => {
    try {
        req = req.params
        const { _id } = req
        const user = await usuarioModels.findByPk(_id);
        const data = await agendamientoUsuariosModels.findAll({
            include: [{
                model: Usuario,
                attributes: ['usu_documento', 'usu_nombre', 'usu_creacion'],
                as: 'Agenda',
            }],
            where: {
                agendado_cedula: _id,
                agendado_resultado: 'APROBADO'
            }
        });
        // if(user.usu_creacion < "2024-10-24T00:00:00.000Z"){
        if(user.usu_creacion < "2024-12-24T00:00:00.000Z"){
            res.send({ "data" : ["Es", "usuario", "antiguo"] });
        }else{
            res.send({ data });
        }
    } catch (e) {
        httpError(res, `ERROR_GET_ITEM_AGENDAMIENTO_ACTIVO`)
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req;
        const data = await agendamientoUsuariosModels.create(body)
        res.send({data})
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM_AGENDAMIENTO_ACTIVO `)
    }
};

/*const createItem = async (req, res) => {
    try {
        const { body } = req;

        // Ajustar agendado_fecha restando 5 horas
        const fechaOriginal = new Date(body.agendado_fecha);
        fechaOriginal.setHours(fechaOriginal.getHours() - 5);

        // Formato YYYY-MM-DDTHH:mm
        const fechaFormateada = fechaOriginal.toISOString().slice(0, 16);

        body.agendado_fecha = fechaFormateada;

        const data = await agendamientoUsuariosModels.create(body);
        res.send({ data });
    } catch (error) {
        httpError(res, `ERROR_GET_ITEM_AGENDAMIENTO_ACTIVO`);
    }
};*/


const patchItem = async (req, res) => {
  try {
    
    const objetoACambiar = req.body;
    const _id = req.params._id;
    
    if (!_id) {
      return res.status(400).send('ID requerido');
    }
    
    const data = await agendamientoUsuariosModels.update(
      objetoACambiar, 
      { 
        where: { 
          _id: _id 
        } 
      }
    );
    
    if (data[0] === 0) {
      return res.status(404).send('No se encontró el registro para actualizar');
    }
    
    res.send('ok');
  } catch (error) {
    console.error('Error en patchItem:', error);
    httpError(res, "ERROR_AGENDAMIENTO_ACTIVO");
  }
};

const getActivePractise = async (req, res) => {
    try {
        req = req.params
        const { _id } = req
        const data = await agendamientoUsuariosModels.findAll({
            where : {
                agendado_cedula : _id,
                agendado_estado : 'ACTIVA'
            },
            include: [
                {
                    model: Practica,
                    attributes: ['practica_cupos', 'practica_estacion', 'practica_fecha'],
                    as: 'Practica',
                    include:[{
                        model: Estacion,
                        attributes: ['est_direccion', 'est_descripcion'],
                        as: 'Estacion',
                      }],
                }
            ]
        });
        res.send({data});
    } catch (e) {
        httpError(res, `ERROR_GET_ITEM_AGENDAMIENTO_ACTIVO ${e}`)
    }
};

const updateItem = async (req, res) => {
    // try {
    //     const { body } = req
    //     const data = await agendamientoUsuariosModels.update(
    //         {
    //             res_estado: body.estado,
    //         },
    //         {
    //             where: { res_id : body.res_id },
    //         }
    //     )
    //     res.send('ok');
    // } catch (error) {
    //     httpError(res, "ERROR_UPDATE_AGENDAMIENTO_ACTIVO");
    // }
};

const sendApprovalEmail = async (req, res) => {
 try {
   const { to, userName, userDocument, adminName, practiceDate } = req.body;

   const usuario = await Usuario.findOne({
     where: { usu_documento: userDocument },
     include: [{
       model: Empresa,
       attributes: ['emp_nombre', 'aplicacion'],
       as: 'bc_empresa'
     }]
   });

   if (!usuario || !usuario.bc_empresa) {
     return res.status(404).send({ 
       success: false, 
       error: 'Usuario o empresa no encontrados' 
     });
   }

     await Usuario.update(
     { usu_habilitado: "1" },
     { where: { usu_documento: userDocument } }
   );

   let emailConfig, templateConfig;
   
   if (usuario.bc_empresa.aplicacion === 'meb') {
     emailConfig = {
       user: 'experiencia@mejorenbici.com',
       pass: 'udtl ydrk pvyf oiev'
     };
     templateConfig = {
       primaryColor: '#4CAF50',
       secondaryColor: '#66BB6A',
       tertiaryColor: '#2E7D32',
       shapeColor: '#81C784',
       logoSrc: 'cid:logoMejorEnBici',
       companyName: 'Mejor en Bici'
     };
   } else if (usuario.bc_empresa.aplicacion === 'ride') {
     emailConfig = {
       user: 'Servicio@bicyclecapital.co',
       pass: 'fyam ecci wqby fhaj' 
     };
     templateConfig = {
       primaryColor: '#FFD700',
       secondaryColor: '#FFC107',
       tertiaryColor: '#F9A825',
       shapeColor: '#B0B0B0',
       logoSrc: 'cid:logoBicycleCapital',
       companyName: 'Bicycle Capital'
     };
   } else {
     return res.status(400).send({ 
       success: false, 
       error: 'Aplicación no válida' 
     });
   }

   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: emailConfig.user,
       pass: emailConfig.pass
     }
   });

    const now = new Date();
    const approvalDate = now.toLocaleDateString('es-CO', { 
    timeZone: 'America/Bogota'
    });
    const approvalTime = now.toLocaleTimeString('es-CO', { 
    timeZone: 'America/Bogota'
    });
   
   // Validación y formateo de fecha de práctica
   let formattedPracticeDate = null;
   let practiceDateRow = '';
   
  if (practiceDate) {
  try {
    let dateObj = null;
    
    if (typeof practiceDate === 'string' && practiceDate.includes('/')) {
      const parts = practiceDate.split(' ');
      const datePart = parts[0];
      const timePart = parts[1] || '00:00';
      
      const [day, month, year] = datePart.split('/');
      const [hour, minute] = timePart.split(':');
      
      dateObj = new Date();
      dateObj.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
      dateObj.setHours(parseInt(hour) || 0, parseInt(minute) || 0, 0, 0);
    } else if (typeof practiceDate === 'string' && practiceDate.includes('T')) {
      dateObj = new Date(practiceDate);
    } else if (typeof practiceDate === 'string' && practiceDate.includes('-')) {
      const dateParts = practiceDate.split('-');
      if (dateParts.length === 3) {
        dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      }
    }
    
    if (dateObj && !isNaN(dateObj.getTime())) {
      formattedPracticeDate = dateObj.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/Bogota'
      });
      
      const hasTime = practiceDate.includes(':');
      if (hasTime) {
        const timeFormatted = dateObj.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Bogota',
          hour12: false
        });
        formattedPracticeDate += ` ${timeFormatted}`;
      }
      
      practiceDateRow = `
        <div class="detail-row">
          <span class="detail-label">Fecha de práctica: </span>
          <span class="detail-value"> ${formattedPracticeDate}</span>
        </div>
      `;
    }
  } catch (error) {
    console.log('Error parsing practice date:', error);
  }
}

   const emailTemplate = `
     <!DOCTYPE html>
     <html lang="es">
     <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <title>Certificado de Movilidad Sostenible</title>
         <style>
             * {
                 margin: 0;
                 padding: 0;
                 box-sizing: border-box;
             }

             body {
                 font-family: 'Arial', 'Helvetica', sans-serif;
                 background: #f5f5f5;
                 margin: 0;
                 padding: 0;
                 -webkit-text-size-adjust: 100%;
                 -ms-text-size-adjust: 100%;
             }

             .certificate {
                 width: 100%;
                 max-width: 900px;
                 margin: 0 auto;
                 background: white;
                 position: relative;
                 overflow: hidden;
             }

             .main-content {
                 position: relative;
                 background: white;
                 min-height: 550px;
             }

             .geometric-header {
                 position: absolute;
                 top: 0;
                 left: 0;
                 right: 0;
                 height: 140px;
                 background: ${templateConfig.primaryColor};
                 overflow: hidden;
             }

             .header-shapes {
                 position: absolute;
                 top: 0;
                 left: 0;
                 width: 100%;
                 height: 140px;
             }

             .angular-shape-1 {
                 position: absolute;
                 top: 0;
                 left: 0;
                 width: 0;
                 height: 0;
                 border-style: solid;
                 border-width: 0 0 140px 200px;
                 border-color: transparent transparent ${templateConfig.shapeColor} transparent;
                 opacity: 0.4;
             }

             .angular-shape-2 {
                 position: absolute;
                 top: 0;
                 left: 150px;
                 width: 0;
                 height: 0;
                 border-style: solid;
                 border-width: 140px 0 0 150px;
                 border-color: ${templateConfig.shapeColor} transparent transparent transparent;
                 opacity: 0.3;
             }

             .angular-shape-3 {
                 position: absolute;
                 top: 0;
                 right: 0;
                 width: 0;
                 height: 0;
                 border-style: solid;
                 border-width: 140px 250px 0 0;
                 border-color: ${templateConfig.shapeColor} transparent transparent transparent;
                 opacity: 0.2;
             }

             .content-wrapper {
                 position: relative;
                 z-index: 10;
                 padding: 0;
                 background: white;
             }

             .content-area {
                 display: flex;
                 align-items: center;
                 padding: 50px 50px 40px 50px;
                 gap: 60px;
                 background: white;
             }

             .person-image {
                 width: 280px;
                 height: 380px;
                 flex-shrink: 0;
                 background-image: url('cid:personBike');
                 background-size: cover;
                 background-position: center;
                 background-repeat: no-repeat;
                 border-radius: 0;
                 margin-top: -80px;
                 z-index: 20;
                 position: relative;
             }

             .text-content {
                 flex: 1;
                 padding-top: 30px;
                 margin-left: 20px;
                 position: relative;
             }

             .certificate-title {
                 font-size: 40px;
                 font-weight: 700;
                 color: ${templateConfig.primaryColor === '#FFD700' ? '#333333' : '#2E7D32'};
                 line-height: 0.95;
                 margin-bottom: 25px;
                 text-transform: uppercase;
                 letter-spacing: -1px;
             }

             .certificate-subtitle {
                 font-size: 16px;
                 color: #666;
                 margin-bottom: 35px;
                 font-weight: 400;
             }

             .user-name {
                 font-size: 48px;
                 color: #B8B8B8;
                 font-weight: 300;
                 margin-bottom: 30px;
                 font-style: italic;
                 line-height: 1;
                 font-family: 'Georgia', 'Times New Roman', serif;
             }

             .description-text {
                 font-size: 16px;
                 color: #333;
                 line-height: 1.6;
                 text-align: start;
                 margin-top: 20px;
             }

             .golden-badge {
                 position: absolute;
                 top: 170px;
                 right: 40px;
                 width: 180px;
                 height: 160px;
                 background-image: url('cid:goldenBadge');
                 background-size: contain;
                 background-repeat: no-repeat;
                 background-position: center;
                 z-index: 30;
             }

             .company-logo {
                 position: absolute;
                 top: 360px;
                 right: 60px;
                 width: 120px;
                 height: 120px;
                 background-image: url('${templateConfig.logoSrc}');
                 background-size: contain;
                 background-repeat: no-repeat;
                 background-position: center;
                 z-index: 30;
             }

             .geometric-footer {
                 position: relative;
                 height: 110px;
                 background: ${templateConfig.primaryColor};
                 display: flex;
                 align-items: center;
                 justify-content: flex-end;
                 padding: 0 20px;
                 overflow: hidden;
             }

             .footer-shapes {
                 position: absolute;
                 bottom: 0;
                 right: 0;
                 width: 100%;
                 height: 110px;
             }

             .angular-footer-1 {
                 position: absolute;
                 bottom: 0;
                 left: 0;
                 width: 0;
                 height: 0;
                 border-style: solid;
                 border-width: 110px 0 0 200px;
                 border-color: transparent transparent transparent ${templateConfig.shapeColor};
                 opacity: 0.4;
             }

             .angular-footer-2 {
                 position: absolute;
                 bottom: 0;
                 left: 150px;
                 width: 0;
                 height: 0;
                 border-style: solid;
                 border-width: 0 0 110px 150px;
                 border-color: transparent transparent ${templateConfig.shapeColor} transparent;
                 opacity: 0.3;
             }

             .angular-footer-3 {
                 position: absolute;
                 bottom: 0;
                 right: 0;
                 width: 0;
                 height: 0;
                 border-style: solid;
                 border-width: 0 250px 110px 0;
                 border-color: transparent ${templateConfig.shapeColor} transparent transparent;
                 opacity: 0.2;
             }

             .details-section {
                 background: #f8f9fa;
                 padding: 35px 50px;
                 border-top: 3px solid ${templateConfig.primaryColor};
             }

             .details-title {
                 font-size: 18px;
                 font-weight: 700;
                 margin-bottom: 20px;
                 color: ${templateConfig.primaryColor === '#FFD700' ? '#333' : '#2E7D32'};
             }

             .detail-row {
                 display: flex;
                 justify-content: space-between;
                 margin-bottom: 12px;
                 font-size: 14px;
                 border-bottom: 1px solid #e0e0e0;
                 padding-bottom: 8px;
             }

             .detail-label {
                 font-weight: 600;
                 color: #666;
             }

             .detail-value {
                 color: #333;
                 font-weight: 500;
             }

             .final-message {
                 margin-top: 25px;
                 text-align: center;
                 color: #666;
                 font-size: 14px;
                 font-style: italic;
                 padding: 15px;
                 background: white;
                 border-radius: 5px;
             }

             /* Tabla responsiva para mejor compatibilidad móvil */
             .desktop-table {
                 width: 100%;
                 border-collapse: collapse;
             }

             .desktop-table td {
                 vertical-align: top;
             }

             /* Media queries mejoradas para móvil */
             @media only screen and (max-width: 768px) {
                 .certificate {
                     margin: 0;
                 }
                 
                 /* Ocultar versión desktop completamente en móvil */
                 .main-content,
                 .geometric-header,
                 .content-wrapper,
                 .desktop-table {
                     display: none !important;
                 }

                 /* Mostrar versión móvil */
                 .mobile-content {
                     display: block !important;
                 }
                 
                 .geometric-footer {
                     height: 60px;
                 }
                 
                 .footer-shapes {
                     height: 60px;
                 }
                 
                 .angular-footer-1 {
                     border-width: 60px 0 0 100px;
                 }

                 .angular-footer-2 {
                     left: 80px;
                     border-width: 0 0 60px 80px;
                 }

                 .angular-footer-3 {
                     border-width: 0 120px 60px 0;
                 }

                 .details-section {
                     padding: 20px 15px;
                 }

                 .details-title {
                     font-size: 16px;
                     margin-bottom: 15px;
                 }

                 .detail-row {
                     flex-direction: column;
                     align-items: flex-start;
                     margin-bottom: 15px;
                     padding-bottom: 10px;
                 }

                 .detail-label {
                     margin-bottom: 5px;
                     font-size: 13px;
                 }

                 .detail-value {
                     font-size: 13px;
                     padding-left: 10px;
                 }

                 .final-message {
                     font-size: 12px;
                     padding: 12px;
                     margin-top: 20px;
                 }

                 /* Ajustes específicos para móvil */
                 .mobile-header {
                     height: 80px;
                     margin-bottom: 0 !important;
                 }

                 .mobile-certificate-content {
                     padding: 25px 20px !important;
                     min-height: 450px !important;
                 }

                 .mobile-title {
                     font-size: 22px !important;
                     line-height: 1.2 !important;
                     margin-bottom: 15px !important;
                 }

                 .mobile-subtitle {
                     font-size: 14px !important;
                     margin-bottom: 25px !important;
                 }

                 .mobile-user-name {
                     font-size: 34px !important;
                     margin-bottom: 30px !important;
                 }

                 .mobile-images {
                     margin-bottom: 30px !important;
                     gap: 25px !important;
                 }

                 .mobile-bike-image {
                     width: 120px !important;
                     height: 150px !important;
                 }

                 .mobile-logos {
                     gap: 25px !important;
                 }

                 .mobile-golden-badge {
                     width: 120px !important;
                     height: 120px !important;
                 }

                 .mobile-company-logo {
                     width: 120px !important;
                     height: 120px !important;
                 }

                 .mobile-description {
                     font-size: 14px !important;
                     margin-bottom: 0 !important;
                     padding: 0 15px !important;
                 }
             }

             /* Por defecto ocultar contenido móvil */
             .mobile-content {
                 display: none;
             }

             /* Estilos específicos para móvil */
             .mobile-header {
                 background: ${templateConfig.primaryColor};
                 height: 80px;
                 position: relative;
                 overflow: hidden;
                 margin-bottom: 0;
             }

             .mobile-certificate-content {
                 padding: 25px 20px;
                 text-align: center;
                 background: white;
                 min-height: 400px;
             }

             .mobile-title {
                 font-size: 22px;
                 font-weight: 700;
                 color: ${templateConfig.primaryColor === '#FFD700' ? '#333333' : '#2E7D32'};
                 margin-bottom: 15px;
                 text-transform: uppercase;
                 line-height: 1.2;
             }

             .mobile-subtitle {
                 font-size: 14px;
                 color: #666;
                 margin-bottom: 20px;
             }

             .mobile-user-name {
                 font-size: 32px;
                 color: #B8B8B8;
                 font-weight: 300;
                 font-style: italic;
                 margin-bottom: 25px;
                 font-family: 'Georgia', 'Times New Roman', serif;
                 line-height: 1.1;
             }

             .mobile-description {
                 font-size: 14px;
                 color: #333;
                 line-height: 1.6;
                 margin-bottom: 0;
                 padding: 0 10px;
             }

             .mobile-images {
                 display: flex;
                 flex-direction: column;
                 justify-content: center;
                 align-items: center;
                 gap: 25px;
                 margin-bottom: 30px;
                 width: 100%;
             }

             .mobile-bike-image {
                 width: 120px;
                 height: 150px;
                 background-image: url('cid:personBike');
                 background-size: cover;
                 background-position: center;
                 background-repeat: no-repeat;
                 border-radius: 8px;
                 margin: 0 auto;
             }

             .mobile-logos {
                 display: flex;
                 flex-direction: row;
                 align-items: center;
                 justify-content: center;
                 gap: 25px;
                 width: 100%;
             }

             .mobile-golden-badge {
                 width: 120px;
                 height: 120px;
                 object-fit: contain;
             }

             .mobile-company-logo {
                 width: 120px;
                 height: 120px;
                 object-fit: contain;
             }
         </style>
     </head>
     <body>
         <div class="certificate">
             <!-- Versión Desktop -->
             <div class="main-content">
                 <div class="geometric-header">
                     <div class="header-shapes">
                         <div class="angular-shape-1"></div>
                         <div class="angular-shape-2"></div>
                         <div class="angular-shape-3"></div>
                     </div>
                 </div>
                 
                 <div class="content-wrapper">
                     <table class="desktop-table" cellpadding="0" cellspacing="0" style="background: white;">
                         <tr>
                             <td width="280" style="padding: 50px 0 40px 20px;">
                                 <div style="width: 280px; height: 380px; background-image: url('cid:personBike'); background-size: cover; background-position: center; background-repeat: no-repeat; margin-top: -80px;"></div>
                             </td>
                             <td style="padding: 80px 15px 40px 40px; min-width: 300px;">
                                 <h1 style="font-size: 34px; font-weight: 700; color: ${templateConfig.primaryColor === '#FFD700' ? '#333333' : '#2E7D32'}; line-height: 1.2; margin-bottom: 25px; text-transform: uppercase; letter-spacing: -1px; font-family: Arial, Helvetica, sans-serif;">CERTIFICADO DE<br>MOVILIDAD SOSTENIBLE</h1>
                                 <p style="font-size: 16px; color: #666; margin-bottom: 35px; font-weight: 400; font-family: Arial, Helvetica, sans-serif;">Este certificado acredita que:</p>
                                 
                                 <div style="font-size: 48px; color: #B8B8B8; font-weight: 300; margin-bottom: 80px; font-style: italic; line-height: 1; font-family: Georgia, Times New Roman, serif;">${userName}</div>
                                 
                                 <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 60px; font-family: Arial, Helvetica, sans-serif;">
                                     Aprobó el examen teórico y práctico que le permite movilizarse de manera segura en bicicleta y patineta.
                                 </p>
                             </td>
                             <td width="220" style="padding: 50px 50px 40px 20px;">
                                 <table width="100%" cellpadding="0" cellspacing="0">
                                     <tr>
                                         <td style="text-align: center; padding-bottom: 40px;">
                                             <img src="cid:goldenBadge" alt="Logo Dorado" style="width: 140px; height: 140px; display: block; margin: 0 auto;" />
                                         </td>
                                     </tr>
                                     <tr>
                                         <td style="text-align: center;">
                                             <img src="${templateConfig.logoSrc}" alt="Logo Empresa" style="width: 180px; height: 180px; display: block; margin: 0 auto; margin-top: 120px;" />
                                         </td>
                                     </tr>
                                 </table>
                             </td>
                         </tr>
                     </table>
                 </div>
             </div>

             <!-- Versión Móvil -->
             <div class="mobile-content">
                 <div class="mobile-header">
                     <div class="header-shapes">
                         <div class="angular-shape-1"></div>
                         <div class="angular-shape-2"></div>
                         <div class="angular-shape-3"></div>
                     </div>
                 </div>
                 
                 <div class="mobile-certificate-content">
                     <h1 class="mobile-title">CERTIFICADO DE<br>MOVILIDAD SOSTENIBLE</h1>
                     <p class="mobile-subtitle">Este certificado acredita que:</p>
                     
                     <div class="mobile-user-name">${userName}</div>
                     
                     <div class="mobile-images">
                         <div class="mobile-bike-image"></div>
                         <div class="mobile-logos">
                             <img src="cid:goldenBadge" alt="Logo Dorado" class="mobile-golden-badge" style="display: block;" />
                             <img src="${templateConfig.logoSrc}" alt="Logo Empresa" class="mobile-company-logo" style="display: block;" />
                         </div>
                     </div>
                     
                     <p class="mobile-description">
                         Aprobó el examen teórico y práctico que le permite movilizarse de manera segura en bicicleta y patineta.
                     </p>
                 </div>
             </div>
             
             <div class="geometric-footer">
                 <div class="footer-shapes">
                     <div class="angular-footer-1"></div>
                     <div class="angular-footer-2"></div>
                     <div class="angular-footer-3"></div>
                 </div>
             </div>

             <div class="details-section">
                 <h3 class="details-title">Detalles de la Certificación</h3>
                 <div class="detail-row">
                     <span class="detail-label">Documento:</span>
                     <span class="detail-value">${userDocument}</span>
                 </div>
                 <div class="detail-row">
                     <span class="detail-label">Empresa:</span>
                     <span class="detail-value">${usuario.bc_empresa.emp_nombre}</span>
                 </div>
                 ${practiceDateRow}
                 <div class="detail-row">
                     <span class="detail-label">Aprobado el:</span>
                     <span class="detail-value">${approvalDate} ${approvalTime}</span>
                 </div>
                 <div class="detail-row">
                     <span class="detail-label">Aprobado por:</span>
                     <span class="detail-value">${adminName}</span>
                 </div>
                 <div class="final-message">
                     A partir de este momento te encuentras activ@ y puedes hacer uso del sistema de vehículos de uso compartido. ¡A RODAR!
                 </div>
             </div>
         </div>
     </body>
     </html>
   `;

   const attachments = [
     {
       filename: 'bici.jpg',
       path: './assets/bici.jpg',
       cid: 'personBike'
     },
     {
       filename: 'logo_dorado.png',
       path: './assets/logo_dorado.png',
       cid: 'goldenBadge'
     }
   ];

   if (usuario.bc_empresa.aplicacion === 'meb') {
     attachments.push({
       filename: 'logo_mejorenbici.png',
       path: './assets/logo_mejorenbici.png',
       cid: 'logoMejorEnBici'
     });
   } else if (usuario.bc_empresa.aplicacion === 'ride') {
     attachments.push({
       filename: 'logo_bicycapital.png',
       path: './assets/logo_bicycapital.png',
       cid: 'logoBicycleCapital'
     });
   }

   await transporter.sendMail({
     from: emailConfig.user,
     to: to,
     subject: `🚲 Certificado de Movilidad Sostenible - ${userName} - ${usuario.bc_empresa.emp_nombre}`,
     html: emailTemplate,
     attachments: attachments
   });

   res.send({ 
     success: true, 
     message: 'Email enviado correctamente',
     fromEmail: emailConfig.user,
     empresa: usuario.bc_empresa.emp_nombre
   });
   
 } catch (error) {
   console.error('Error enviando email:', error);
   res.status(500).send({ 
     success: false, 
     error: 'Error al enviar email: ' + error.message
   });
 }
};

const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem, patchItem, getActivePractise, sendApprovalEmail
}
