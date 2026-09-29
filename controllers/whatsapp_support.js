const models = require('../models');
const { httpError } = require('../utils/handleError');

const BOT_API_URL = process.env.WHATSAPP_BOT_API_URL || 'http://127.0.0.1:8000';

/**
 * Obtener lista de tickets de soporte WhatsApp con enriquecimiento de datos de usuario y préstamos activos.
 */
const getTickets = async (req, res) => {
    try {
        const { status } = req.query;
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const tickets = await models.whatsappTicketsModels.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit: 100,
        });

        // Enriquecer cada ticket con datos del usuario de la plataforma RIDE
        const enriched = await Promise.all(tickets.map(async (ticket) => {
            const raw = ticket.toJSON();
            let parsedContext = {};
            try {
                parsedContext = raw.context_data ? JSON.parse(raw.context_data) : {};
            } catch (e) {
                parsedContext = {};
            }

            const doc = parsedContext.documento || null;
            let userData = null;
            let activeLoan = null;

            if (doc) {
                try {
                    userData = await models.usuarioModels.findOne({
                        where: { usu_documento: doc },
                        attributes: ['usu_documento', 'usu_nombre', 'usu_email', 'usu_telefono', 'usu_empresa', 'usu_ciudad'],
                    });
                } catch (e) {
                    userData = null;
                }

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

        const messages = await models.whatsappChatMessagesModels.findAll({
            where: { wa_id: cleanWaId },
            order: [['created_at', 'ASC']],
            limit: 200,
        });

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

        // Reenviar a la API del bot de WhatsApp
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

        const ticket = await models.whatsappTicketsModels.findOne({
            where: { ticket_number },
        });

        if (!ticket) {
            return res.status(404).json({ error: 'TICKET_NOT_FOUND' });
        }

        ticket.assigned_agent = assignedName;
        ticket.status = 'ASSIGNED';
        await ticket.save();

        res.json({ success: true, ticket_number, assigned_agent: assignedName });
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

        // 1. Notificar al bot de FastAPI para reactivar el estado y enviar despedida
        try {
            await fetch(`${BOT_API_URL}/api/v1/support/conversations/${cleanWaId}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    farewell_message: farewell_message || null,
                }),
            });
        } catch (botErr) {
            console.warn('Aviso: no se pudo notificar al bot de FastAPI directamente, resolviendo en BD:', botErr.message);
        }

        // 2. Actualizar estado del ticket en BD
        await models.whatsappTicketsModels.update(
            { status: 'RESOLVED' },
            { where: { wa_id: cleanWaId, status: ['OPEN', 'ASSIGNED'] } }
        );

        res.json({ success: true, wa_id: cleanWaId, status: 'RESOLVED' });
    } catch (error) {
        console.error('Error al resolver ticket de WhatsApp:', error);
        httpError(res, 'ERROR_RESOLVE_WHATSAPP_TICKET', 500);
    }
};

module.exports = {
    getTickets,
    getMessages,
    sendMessage,
    assignTicket,
    resolveTicket,
};
