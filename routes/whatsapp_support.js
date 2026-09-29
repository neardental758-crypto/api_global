const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const {
    getTickets,
    getMessages,
    sendMessage,
    assignTicket,
    resolveTicket,
} = require('../controllers/whatsapp_support');

/**
 * Rutas de Soporte WhatsApp para Dashboard SAU
 * Base URL: /api/whatsapp_support
 */

// Listar tickets de soporte (filtro opcional ?status=OPEN | ASSIGNED | RESOLVED)
router.get('/tickets', authMiddleware(['all']), getTickets);

// Obtener historial cronológico de mensajes de una conversación
router.get('/conversations/:wa_id/messages', authMiddleware(['all']), getMessages);

// Enviar mensaje del asesor hacia el usuario de WhatsApp
router.post('/conversations/:wa_id/send', authMiddleware(['all']), sendMessage);

// Asignar ticket a un asesor
router.post('/tickets/:ticket_number/assign', authMiddleware(['all']), assignTicket);

// Finalizar atención, resolver ticket y reactivar el bot
router.post('/conversations/:wa_id/resolve', authMiddleware(['all']), resolveTicket);

module.exports = router;
