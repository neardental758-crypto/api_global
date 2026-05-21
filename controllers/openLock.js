const { candadosModels } = require('../models');
const { getSocketByImei, sendToLock } = require('../services/lockTcpService');
const { httpError } = require('../utils/handleError');

/**
 * Endpoint para abrir un candado por medio de su IMEI a través de TCP
 * GET /api/openLock/:imei
 */
const openLockByImei = async (req, res) => {
    try {
        const { imei } = req.params;

        if (!imei || imei.length !== 15) {
            return res.status(400).send({ error: "El IMEI provisto es inválido o no tiene 15 dígitos." });
        }

        // 1. Verificar si el candado existe en la base de datos
        const candado = await candadosModels.findOne({
            where: { can_imei: imei }
        });

        if (!candado) {
            return res.status(404).send({ error: "Candado no encontrado en el sistema." });
        }

        // 2. Buscar si hay una conexión de socket TCP activa para este candado
        const socket = getSocketByImei(imei);

        if (!socket || socket.destroyed) {
            return res.status(400).send({ 
                error: "El candado no está conectado al servidor TCP en este momento.",
                connected: false 
            });
        }

        // 3. Obtener el timestamp actual en segundos
        const timestamp = Math.floor(Date.now() / 1000);

        // 4. Construir el comando L0 según el protocolo:
        // *CMDS,OM,<IMEI>,000000000000,L0,<resetTimer>,<userID>,<timestamp>#\n
        // resetTimer = 0 (reset), userID = 0 (por defecto)
        const command = `*CMDS,OM,${imei},000000000000,L0,0,0,${timestamp}#\n`;

        // 5. Enviar el comando al socket
        const sent = sendToLock(socket, command);

        if (!sent) {
            return res.status(500).send({ error: "No se pudo transmitir el comando al candado. Error de comunicación." });
        }

        // 6. Registrar en DB la fecha y el comando enviado
        await candadosModels.update({
            can_fecha_ultimo_comando: new Date(),
            can_ultimo_comando: 'L0_sent_remote'
        }, {
            where: { can_imei: imei }
        });

        console.log(`[LockController] Petición de apertura enviada correctamente para IMEI: ${imei}`);
        
        return res.send({ 
            message: "Se ha realizado la petición de apertura correctamente.",
            imei,
            success: true
        });

    } catch (error) {
        console.error("Error en openLockByImei:", error);
        return httpError(res, "ERROR_OPEN_LOCK_TCP");
    }
};

module.exports = {
    openLockByImei
};
