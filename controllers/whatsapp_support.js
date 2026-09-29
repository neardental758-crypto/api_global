const models = require('../models');
const { httpError } = require('../utils/handleError');

const BOT_API_URL = process.env.WHATSAPP_BOT_API_URL || 'https://bot.movilidadsostenible.cloud';

/**
 * Obtener lista de tickets de soporte WhatsApp con enriquecimiento de datos de usuario y préstamos activos.
 */
const getTickets = async (req, res) => {
    try {
        const { status } = req.query;
        let url = `${BOT_API_URL}/api/v1/support/tickets`;
        if (status) {
            url += `?status=${encodeURIComponent(status)}`;
        }

        const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!resp.ok) {
            const errText = await resp.text();
            console.error('Error desde bot API getTickets:', resp.status, errText);
            return res.status(resp.status).json({ error: 'BOT_API_ERROR', details: errText });
        }

        const tickets = await resp.json();

        // Enriquecer cada ticket con datos del usuario de la plataforma RIDE desde MySQL
        const enriched = await Promise.all(tickets.map(async (raw) => {
            const parsedContext = raw.context_data || {};
            const doc = parsedContext.documento || null;
            let userData = null;
            let activeLoan = null;

            if (doc && models.usuarioModels) {
                try {
                    userData = await models.usuarioModels.findOne({
                        where: { usu_documento: doc },
                        attributes: ['usu_documento', 'usu_nombre', 'usu_email', 'usu_telefono', 'usu_empresa', 'usu_ciudad'],
                    });
                } catch (e) {
                    userData = null;
                }

                if (models.prestamosModels) {
                    try {
                        activeLoan = await models.prestamosModels.findOne({
                            where: {
                                pre_usuario: doc,
                                pre_estado: 'ACTIVO',
                            },
                            attributes: ['pre_id', 'pre_fecha_prestamo', 'pre_bicicleta'],
                            include: [
                                {
                                    model: models.bicicletasModels,
                                    attributes: ['bic_id', 'bic_numero', 'bic_nombre', 'bic_tipo'],
                                    required: false,
                                },
                            ],
                        });
                    } catch (e) {
                        activeLoan = null;
                    }
                }
            }

            return {
                ...raw,
                context_data: parsedContext,
                user_profile: userData,
                active_loan: activeLoan,
            };
        }));

        res.json(enriched);
    } catch (error) {
        console.error('Error al consultar tickets de WhatsApp:', error);
        httpError(res, 'ERROR_GET_WHATSAPP_TICKETS', 500);
    }
};

/**
 * Obtener historial de mensajes de una conversación por wa_id.
 */
const getMessages = async (req, res) => {
    try {
        const { wa_id } = req.params;
        const cleanWaId = (wa_id || '').replace(/\D/g, '');

        if (!cleanWaId) {
            return res.status(400).json({ error: 'WA_ID_REQUIRED' });
        }

        const resp = await fetch(`${BOT_API_URL}/api/v1/support/conversations/${cleanWaId}/messages`, {
            headers: { 'Accept': 'application/json' },
        });

        if (!resp.ok) {
            const errText = await resp.text();
            console.error('Error desde bot API getMessages:', resp.status, errText);
            return res.status(resp.status).json({ error: 'BOT_API_ERROR', details: errText });
        }

        const messages = await resp.json();
        res.json(messages);
    } catch (error) {
        console.error('Error al consultar historial de mensajes:', error);
        httpError(res, 'ERROR_GET_WHATSAPP_MESSAGES', 500);
    }
};

/**
 * Enviar mensaje del asesor al usuario de WhatsApp a través del bot FastAPI.
 */
const sendMessage = async (req, res) => {
    try {
        const { wa_id } = req.params;
        const cleanWaId = (wa_id || '').replace(/\D/g, '');
        const { message, agent_name } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'MESSAGE_REQUIRED' });
        }

        const senderName = agent_name || req.user?.nombre || req.user?.usu_nombre || 'Asesor SAU';

        const botResponse = await fetch(`${BOT_API_URL}/api/v1/support/conversations/${cleanWaId}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message.trim(),
                agent_name: senderName,
            }),
        });

        if (!botResponse.ok) {
            const errText = await botResponse.text();
            console.error('Fallo del bot al enviar mensaje:', errText);
            return res.status(502).json({ error: 'ERROR_DISPATCHING_WHATSAPP_MESSAGE', details: errText });
        }

        const data = await botResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Error al enviar mensaje de WhatsApp:', error);
        httpError(res, 'ERROR_SEND_WHATSAPP_MESSAGE', 500);
    }
};

/**
 * Asignar un ticket a un asesor específico.
 */
const assignTicket = async (req, res) => {
    try {
        const { ticket_number } = req.params;
        const { agent_name } = req.body;
        const assignedName = agent_name || req.user?.nombre || req.user?.usu_nombre || 'Asesor SAU';

        const botResponse = await fetch(`${BOT_API_URL}/api/v1/support/tickets/${ticket_number}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent_name: assignedName,
            }),
        });

        if (!botResponse.ok) {
            const errText = await botResponse.text();
            console.error('Fallo al asignar ticket en bot API:', errText);
            return res.status(botResponse.status).json({ error: 'ERROR_ASSIGNING_TICKET', details: errText });
        }

        const data = await botResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Error al asignar ticket de WhatsApp:', error);
        httpError(res, 'ERROR_ASSIGN_WHATSAPP_TICKET', 500);
    }
};

/**
 * Finalizar la atención del ticket y reactivar el bot.
 */
const resolveTicket = async (req, res) => {
    try {
        const { wa_id } = req.params;
        const cleanWaId = (wa_id || '').replace(/\D/g, '');
        const { farewell_message } = req.body;

        const botResponse = await fetch(`${BOT_API_URL}/api/v1/support/conversations/${cleanWaId}/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                farewell_message: farewell_message || null,
            }),
        });

        if (!botResponse.ok) {
            const errText = await botResponse.text();
            console.error('Fallo al resolver ticket en bot API:', errText);
            return res.status(botResponse.status).json({ error: 'ERROR_RESOLVING_TICKET', details: errText });
        }

        const data = await botResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Error al resolver ticket de WhatsApp:', error);
        httpError(res, 'ERROR_RESOLVE_WHATSAPP_TICKET', 500);
    }
};

/**
 * Obtener la configuración actual de horarios de atención del bot.
 */
const getScheduleSettings = async (req, res) => {
    try {
        const botResponse = await fetch(`${BOT_API_URL}/api/v1/support/settings/schedule`, {
            headers: { 'Accept': 'application/json' },
        });

        if (!botResponse.ok) {
            const errText = await botResponse.text();
            console.error('Error al obtener horarios desde bot API:', errText);
            return res.status(botResponse.status).json({ error: 'BOT_SCHEDULE_ERROR', details: errText });
        }

        const data = await botResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Error al consultar horarios de WhatsApp:', error);
        httpError(res, 'ERROR_GET_SCHEDULE_SETTINGS', 500);
    }
};

/**
 * Actualizar la configuración de horarios de atención del bot.
 */
const updateScheduleSettings = async (req, res) => {
    try {
        const { is_enabled, mode, timezone, schedule_config, out_of_hours_message, allow_emergencies } = req.body;

        const botResponse = await fetch(`${BOT_API_URL}/api/v1/support/settings/schedule`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                is_enabled: is_enabled !== undefined ? is_enabled : true,
                mode: mode || 'ALL_BOT',
                timezone: timezone || 'America/Bogota',
                schedule_config: schedule_config || {},
                out_of_hours_message: out_of_hours_message || '',
                allow_emergencies: allow_emergencies !== undefined ? allow_emergencies : true,
            }),
        });

        if (!botResponse.ok) {
            const errText = await botResponse.text();
            console.error('Error al actualizar horarios en bot API:', errText);
            return res.status(botResponse.status).json({ error: 'BOT_SCHEDULE_UPDATE_ERROR', details: errText });
        }

        const data = await botResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Error al actualizar horarios de WhatsApp:', error);
        httpError(res, 'ERROR_UPDATE_SCHEDULE_SETTINGS', 500);
    }
};

module.exports = {
    getTickets,
    getMessages,
    sendMessage,
    assignTicket,
    resolveTicket,
    getScheduleSettings,
    updateScheduleSettings,
};

