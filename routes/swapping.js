const express = require('express');
const router = express.Router();
const { usuarioModels, candadosModels, bicicletasModels, cambiosBateriasModels } = require('../models');
const authMiddleware = require('../middleware/session');
const { getSocketByImei, sendToLock } = require('../services/lockTcpService');
const { Op } = require('sequelize');

/**
 * POST /api/swapping/verify
 * Validates the operator role and fetches lock/vehicle battery levels.
 */
router.post('/verify', authMiddleware(['all']), async (req, res) => {
    try {
        const { qrNumber, operatorId } = req.body;

        if (!qrNumber || !operatorId) {
            return res.status(400).send({ error: "El código QR y el ID de operario son obligatorios." });
        }

        // 1. Validar que el operario tenga rol 'swapping'
        const operario = await usuarioModels.findByPk(operatorId);
        if (!operario) {
            return res.status(404).send({ error: "Operario no encontrado en la base de datos." });
        }

        if (!operario.usu_rol_dash || !operario.usu_rol_dash.toLowerCase().includes('swapping')) {
            return res.status(403).send({ error: "Acceso denegado. No tienes rol de swapping." });
        }

        // 2. Buscar el candado por MAC, IMEI o número de QR
        const candado = await candadosModels.findOne({
            where: {
                [Op.or]: [
                    { can_mac: qrNumber },
                    { can_imei: qrNumber },
                    { can_qr_numero: qrNumber }
                ]
            }
        });

        if (!candado) {
            return res.status(404).send({ error: "Candado no encontrado." });
        }

        // 3. Buscar la bicicleta asociada
        let bike = null;
        if (candado.can_bicicleta) {
            bike = await bicicletasModels.findByPk(candado.can_bicicleta);
        }

        return res.send({
            success: true,
            lock: {
                id: candado.can_id,
                imei: candado.can_imei,
                mac: candado.can_mac,
                qrNumber: candado.can_qr_numero || qrNumber,
                lockStatus: candado.can_estado_candado,
                battery: candado.can_bateria || 0,
                batteryVehiculo: candado.can_bateria_vehiculo || 0
            },
            bike: bike ? {
                id: bike.bic_id,
                nombre: bike.bic_nombre,
                numero: bike.bic_numero,
                estado: bike.bic_estado,
                estacion: bike.bic_estacion
            } : null
        });

    } catch (error) {
        console.error("Error en swapping/verify:", error);
        return res.status(500).send({ error: "Error al validar la información del swapping." });
    }
});

/**
 * POST /api/swapping/release
 * Commands the lock to unlock the battery and registers the transaction.
 */
router.post('/release', authMiddleware(['all']), async (req, res) => {
    try {
        const { imei, bikeId, operatorId } = req.body;

        if (!imei || !bikeId || !operatorId) {
            return res.status(400).send({ error: "El IMEI, BikeID e ID de operario son obligatorios." });
        }

        // 1. Validar que el operario tenga rol 'swapping'
        const operario = await usuarioModels.findByPk(operatorId);
        if (!operario) {
            return res.status(404).send({ error: "Operario no encontrado." });
        }

        if (!operario.usu_rol_dash || !operario.usu_rol_dash.toLowerCase().includes('swapping')) {
            return res.status(403).send({ error: "Acceso denegado. No tienes rol de swapping." });
        }

        // 2. Buscar si hay una conexión activa para este IMEI
        const socket = getSocketByImei(imei);
        if (!socket || socket.destroyed) {
            return res.status(400).send({
                error: "El dispositivo no está conectado al servidor TCP en este momento.",
                connected: false
            });
        }

        // 3. Determinar el header de protocolo dinámicamente
        // Si el candado reportó con cabecera *SCOR (M136), enviamos con *SCOS. De lo contrario, *CMDS.
        const header = (socket.headerType === '*SCOR') ? '*SCOS' : '*CMDS';
        const deviceCode = socket.deviceCode || 'OM';
        
        // Comando L5 con operacion 1: Liberación de batería
        const command = `${header},${deviceCode},${imei},000000000000,L5,1#\n`;

        // 4. Enviar el comando
        const sent = sendToLock(socket, command);
        if (!sent) {
            return res.status(500).send({ error: "Error al transmitir el comando al candado." });
        }

        // 5. Registrar el inicio del cambio de batería en la base de datos
        const candadoId = `can_${imei}`;
        const transaction = await cambiosBateriasModels.create({
            cba_operario_id: operatorId,
            cba_vehiculo_id: bikeId,
            cba_candado_id: candadoId,
            cba_fecha: new Date(),
            cba_estado: 'PENDIENTE'
        });

        // 6. Actualizar el último comando del candado
        await candadosModels.update({
            can_fecha_ultimo_comando: new Date(),
            can_ultimo_comando: 'L5_battery_release_sent'
        }, {
            where: { can_id: candadoId }
        });

        console.log(`[Swapping] Comando L5 de liberación enviado para IMEI: ${imei}. Log ID: ${transaction.cba_id}`);

        return res.send({
            success: true,
            message: "Se ha solicitado la liberación de la batería correctamente.",
            transactionId: transaction.cba_id
        });

    } catch (error) {
        console.error("Error en swapping/release:", error);
        return res.status(500).send({ error: "Error al enviar solicitud de liberación de batería." });
    }
});

module.exports = router;
