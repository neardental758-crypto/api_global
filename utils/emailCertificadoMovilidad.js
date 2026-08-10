const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

/**
 * Envia el correo con el diploma de aprobación de un submódulo de Introducción a la Movilidad Sostenible.
 * 
 * @param {Object} params
 * @param {string} params.to Email del destinatario
 * @param {string} params.userName Nombre completo del usuario
 * @param {string} params.userDocument Número de documento del usuario
 * @param {string} params.tituloModulo Nombre del submódulo aprobado
 * @param {number} params.aciertos Preguntas correctas
 * @param {number} params.totalPreguntas Total de preguntas
 * @param {number} params.porcentaje Porcentaje de aciertos
 * @param {Object} params.empresaObj Objeto con la información de la empresa del usuario
 */
const enviarCertificadoMovilidad = async ({
    to,
    userName,
    userDocument,
    tituloModulo,
    aciertos,
    totalPreguntas,
    porcentaje,
    empresaObj
}) => {
    try {
        if (!to) {
            console.warn('[emailCertificadoMovilidad] No se especificó correo electrónico de destino.');
            return { success: false, error: 'NO_DESTINATARIO' };
        }

        const appType = (empresaObj && empresaObj.aplicacion) ? String(empresaObj.aplicacion).toLowerCase() : 'ride';
        const empNombre = (empresaObj && empresaObj.emp_nombre) ? empresaObj.emp_nombre.toUpperCase() : 'ORGANIZACIÓN';

        let emailConfig, templateConfig;

        if (appType === 'meb') {
            emailConfig = {
                user: 'experiencia@mejorenbici.com',
                pass: 'udtl ydrk pvyf oiev'
            };
            templateConfig = {
                primaryColor: '#2E7D32',
                secondaryColor: '#4CAF50',
                tertiaryColor: '#1B5E20',
                logoSrc: 'cid:logoMejorEnBici',
                companyName: 'Mejor en Bici'
            };
        } else {
            emailConfig = {
                user: 'Servicio@bicyclecapital.co',
                pass: 'fyam ecci wqby fhaj'
            };
            templateConfig = {
                primaryColor: '#2E7D32',
                secondaryColor: '#4CAF50',
                tertiaryColor: '#1B5E20',
                logoSrc: 'cid:logoBicycleCapital',
                companyName: 'Bicycle Capital'
            };
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
            timeZone: 'America/Bogota',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const approvalTime = now.toLocaleTimeString('es-CO', {
            timeZone: 'America/Bogota',
            hour: '2-digit',
            minute: '2-digit'
        });

        const safeUserName = userName ? userName.trim() : 'USUARIO RIDE';
        const safeDoc = userDocument ? userDocument.trim() : 'N/A';
        const safeModulo = tituloModulo ? tituloModulo.trim() : 'Introducción a la Movilidad Sostenible';

        const emailTemplate = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificado de Movilidad Sostenible</title>
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F4F6F8; color: #333333; }
              .certificate-container { max-width: 700px; margin: 20px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 2px solid #E2E8F0; }
              .header-banner { background: linear-gradient(135deg, ${templateConfig.primaryColor} 0%, ${templateConfig.secondaryColor} 100%); padding: 35px 25px; text-align: center; color: #FFFFFF; position: relative; }
              .header-badge { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; display: inline-block; margin-bottom: 12px; }
              .header-title { font-size: 26px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
              .header-subtitle { font-size: 16px; font-weight: 500; opacity: 0.9; margin-top: 6px; }
              
              .content-body { padding: 40px 30px; text-align: center; }
              .accreditation-label { font-size: 15px; color: #718096; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 15px; }
              .user-name { font-size: 32px; font-weight: 800; color: ${templateConfig.tertiaryColor}; margin-bottom: 25px; font-family: Georgia, serif; font-style: italic; border-bottom: 2px solid #E2E8F0; display: inline-block; padding-bottom: 8px; }
              .achievement-text { font-size: 16px; line-height: 1.7; color: #4A5568; max-width: 580px; margin: 0 auto 30px auto; }
              .achievement-highlight { font-weight: 700; color: ${templateConfig.primaryColor}; }
              
              .badges-row { display: flex; justify-content: center; align-items: center; margin: 25px 0; gap: 20px; }
              .badge-img { width: 110px; height: 110px; object-fit: contain; }
              
              .details-card { background-color: #F8FAFC; border-radius: 8px; padding: 20px 25px; margin-top: 30px; text-align: left; border: 1px solid #E2E8F0; }
              .details-title { font-size: 14px; font-weight: 700; color: #2D3748; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #CBD5E0; padding-bottom: 6px; }
              .detail-item { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
              .detail-label { color: #718096; font-weight: 500; }
              .detail-value { color: #1A202C; font-weight: 700; }
              
              .footer-banner { background-color: #1A202C; color: #A0AEC0; padding: 20px 30px; text-align: center; font-size: 13px; line-height: 1.5; }
              .footer-link { color: ${templateConfig.secondaryColor}; text-decoration: none; font-weight: 600; }
          </style>
      </head>
      <body>
          <div class="certificate-container">
              <div class="header-banner">
                  <div class="header-badge">🌱 Movilidad Sostenible</div>
                  <h1 class="header-title">CERTIFICADO DE APROBACIÓN</h1>
                  <div class="header-subtitle">${safeModulo}</div>
              </div>
              
              <div class="content-body">
                  <div class="accreditation-label">Este diploma certifica que</div>
                  <div class="user-name">${safeUserName}</div>
                  
                  <p class="achievement-text">
                      Ha aprobado satisfactoriamente el submódulo de aprendizaje <span class="achievement-highlight">"${safeModulo}"</span> del programa de <span class="achievement-highlight">Introducción a la Movilidad Sostenible</span>, demostrando el compromiso y los conocimientos requeridos para una movilidad limpia, segura y eficiente.
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                      <tr>
                          <td align="center" width="50%">
                              <img src="cid:goldenBadge" alt="Insignia de Logro" width="120" style="display: block; margin: 0 auto; max-width: 120px;" />
                          </td>
                          <td align="center" width="50%">
                              <img src="${templateConfig.logoSrc}" alt="Logo Marca" width="150" style="display: block; margin: 0 auto; max-width: 150px;" />
                          </td>
                      </tr>
                  </table>
                  
                  <div class="details-card">
                      <div class="details-title">Detalles de la Certificación</div>
                      <div class="detail-item">
                          <span class="detail-label">Documento de Identidad:</span>
                          <span class="detail-value">${safeDoc}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">Organización / Empresa:</span>
                          <span class="detail-value">${empNombre}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">Submódulo Educativo:</span>
                          <span class="detail-value">${safeModulo}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">Resultado Evaluativo:</span>
                          <span class="detail-value" style="color: ${templateConfig.primaryColor};">${aciertos} / ${totalPreguntas} aciertos (${porcentaje}%)</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">Fecha de Emisión:</span>
                          <span class="detail-value">${approvalDate} a las ${approvalTime}</span>
                      </div>
                  </div>
              </div>
              
              <div class="footer-banner">
                  Certificado emitido automáticamente por el sistema de <strong>${templateConfig.companyName}</strong>.<br/>
                  Promoviendo ciudades más limpias y sostenibles. ¡Gracias por moverte en bici!
              </div>
          </div>
      </body>
      </html>
        `;

        const assetsDir = path.join(__dirname, '../assets');
        const attachments = [];

        const logoDoradoPath = path.join(assetsDir, 'logo_dorado.png');
        if (fs.existsSync(logoDoradoPath)) {
            attachments.push({
                filename: 'logo_dorado.png',
                path: logoDoradoPath,
                cid: 'goldenBadge'
            });
        }

        if (appType === 'meb') {
            const logoMebPath = path.join(assetsDir, 'logo_mejorenbici.png');
            if (fs.existsSync(logoMebPath)) {
                attachments.push({
                    filename: 'logo_mejorenbici.png',
                    path: logoMebPath,
                    cid: 'logoMejorEnBici'
                });
            }
        } else {
            const logoRidePath = path.join(assetsDir, 'logo_bicycapital.png');
            if (fs.existsSync(logoRidePath)) {
                attachments.push({
                    filename: 'logo_bicycapital.png',
                    path: logoRidePath,
                    cid: 'logoBicycleCapital'
                });
            }
        }

        console.log(`[emailCertificadoMovilidad] Enviando certificado de "${safeModulo}" a ${to}...`);

        const info = await transporter.sendMail({
            from: emailConfig.user,
            to: to,
            subject: `🎓 Certificado de Aprobación: ${safeModulo} - ${safeUserName}`,
            html: emailTemplate,
            attachments: attachments
        });

        console.log(`[emailCertificadoMovilidad] Certificado enviado con éxito. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('[emailCertificadoMovilidad] Error enviando correo de certificado:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { enviarCertificadoMovilidad };
