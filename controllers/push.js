const { matchedData } = require('express-validator');
const admin = require('../config/firebase');

const enviarPush = async (req, res) => {
    try {
        const { token, title, body, data } = matchedData(req);

        console.log('📤 Enviando notificación a:', token);

        const message = {
            notification: {
                title: title || 'Ride',
                body: body,
            },
            token: token,
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'default',
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        };

        if (data) {
            message.data = data;
        }

        const response = await admin.messaging().send(message);
        
        console.log('✅ Notificación enviada:', response);

        res.status(200).json({
            success: true,
            message: 'Notificación enviada correctamente',
            messageId: response
        });

    } catch (error) {
        console.error('❌ Error al enviar notificación:', error);

        let errorMessage = 'Error al enviar la notificación';
        let statusCode = 500;

        if (error.code === 'messaging/invalid-registration-token' || 
            error.code === 'messaging/registration-token-not-registered') {
            errorMessage = 'Token de dispositivo inválido o no registrado';
            statusCode = 400;
        } else if (error.code === 'messaging/invalid-argument') {
            errorMessage = 'Argumentos inválidos en la notificación';
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: error.message,
            code: error.code
        });
    }
};

const enviarPushMultiple = async (req, res) => {
    try {
        const { tokens, title, body, data } = matchedData(req);

        if (!Array.isArray(tokens) || tokens.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere un array de tokens válido'
            });
        }

        const message = {
            notification: {
                title: title || 'Ride',
                body: body,
            },
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                    },
                },
            },
        };

        if (data) {
            message.data = data;
        }

        const response = await admin.messaging().sendEachForMulticast({
            ...message,
            tokens: tokens
        });

        console.log(`✅ ${response.successCount} de ${tokens.length} notificaciones enviadas`);

        res.status(200).json({
            success: true,
            message: 'Notificaciones procesadas',
            successCount: response.successCount,
            failureCount: response.failureCount
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al enviar las notificaciones',
            details: error.message
        });
    }
};

module.exports = { 
    enviarPush,
    enviarPushMultiple 
};