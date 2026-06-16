const { reportesContradiccionesModels, usuarioModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { matchedData } = require('express-validator');

const getItems = async (req, res) => {
    try {
        const data = await reportesContradiccionesModels.findAll({
            include: [
                {
                    model: usuarioModels,
                    as: 'tecnico',
                    attributes: ['usu_nombre', 'usu_email', 'usu_telefono', 'usu_empresa'],
                    required: false
                }
            ],
            order: [['rep_fecha_creacion', 'DESC']]
        });
        
        // Map data to include flat technician names for simplicity in frontend
        const mappedData = data.map(item => {
            const doc = item.toJSON();
            return {
                ...doc,
                tecnico_nombre: doc.tecnico?.usu_nombre || doc.rep_tecnico_documento,
                tecnico_email: doc.tecnico?.usu_email || 'N/A',
                tecnico_telefono: doc.tecnico?.usu_telefono || 'N/A',
                tecnico_empresa: doc.tecnico?.usu_empresa || 'N/A'
            };
        });

        res.send({ data: mappedData });
    } catch (error) {
        console.error("Error en getItems reportes contradicciones:", error);
        httpError(res, "ERROR_GET_REPORTES_CONTRADICCIONES");
    }
};

const createItem = async (req, res) => {
    try {
        const body = matchedData(req);
        const data = await reportesContradiccionesModels.create(body);

        // Fetch technician name to make the Slack notification message clearer
        let techName = body.rep_tecnico_documento;
        try {
            const tech = await usuarioModels.findOne({ where: { usu_documento: body.rep_tecnico_documento } });
            if (tech) {
                techName = `${tech.usu_nombre} (${body.rep_tecnico_documento})`;
            }
        } catch (err) {
            console.error("Error fetching tech user for slack notification:", err);
        }

        // Send Slack alert automatically to the admin channel
        if (process.env.SLACK_WEBHOOK) {
            const { IncomingWebhook } = require('@slack/webhook');
            const slackWebhook = new IncomingWebhook(process.env.SLACK_WEBHOOK);
            
            slackWebhook.send({
                text: `🚨 *Nueva Contradicción Reportada en Estación* 🚨\n\n*Estación:* ${body.rep_estacion}\n*Vehículo:* #${body.rep_bicicleta_numero || 'Ninguno'}\n*Reportado por:* ${techName}\n*Comentario:* ${body.rep_comentario}\n\n_Revisa y gestiona este reporte en el Dashboard: Notificaciones > Contradicciones Estación._`
            }).catch(err => {
                console.error("Error sending Slack notification:", err);
            });
        }

        res.status(201).send({ data });
    } catch (error) {
        console.error("Error al registrar reporte contradiccion:", error);
        httpError(res, "ERROR_CREATE_REPORTE_CONTRADICCION");
    }
};

const updateItem = async (req, res) => {
    try {
        const body = matchedData(req);
        const { rep_id, estado } = body;

        const report = await reportesContradiccionesModels.findByPk(rep_id);
        if (!report) {
            return res.status(404).send({ error: "Reporte no encontrado" });
        }

        await reportesContradiccionesModels.update(
            { rep_estado: estado },
            { where: { rep_id: rep_id } }
        );

        res.send({ message: "Estado de reporte actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar reporte contradiccion:", error);
        httpError(res, "ERROR_UPDATE_REPORTE_CONTRADICCION");
    }
};

module.exports = { getItems, createItem, updateItem };
