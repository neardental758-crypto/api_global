const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const {
    getTickets,
    getMessages,
    sendMessage,
    assignTicket,
    resolveTicket,
    resolveTicketByNumber,
    getScheduleSettings,
    updateScheduleSettings,
    getMediaAudio,
    getMediaImage,
} = require('../controllers/whatsapp_support');

/**
 * Rutas de Soporte WhatsApp para Dashboard SAU
 * Base URL: /api/whatsapp_support
 */

// Listar tickets de soporte (filtro opcional ?status=OPEN | ASSIGNED | RESOLVED)
router.get('/tickets', authMiddleware(['all']), getTickets);

// Obtener historial cronológico de mensajes de una conversación
router.get('/conversations/:wa_id/messages', authMiddleware(['all']), getMessages);

// Streaming de archivos de audio / notas de voz
router.get('/media/audio/:filename', getMediaAudio);

// Streaming de archivos de imagen enviados en WhatsApp
router.get('/media/image/:filename', getMediaImage);

// Enviar mensaje del asesor hacia el usuario de WhatsApp
router.post('/conversations/:wa_id/send', authMiddleware(['all']), sendMessage);

// Asignar ticket a un asesor
router.post('/tickets/:ticket_number/assign', authMiddleware(['all']), assignTicket);

// Finalizar atención directamente por ticket_number
router.post('/tickets/:ticket_number/resolve', authMiddleware(['all']), resolveTicketByNumber);

// Finalizar atención, resolver ticket y reactivar el bot por wa_id
router.post('/conversations/:wa_id/resolve', authMiddleware(['all']), resolveTicket);

// Configuración de horarios de atención dinámica
router.get('/settings/schedule', authMiddleware(['all']), getScheduleSettings);
router.put('/settings/schedule', authMiddleware(['all']), updateScheduleSettings);

module.exports = router;
