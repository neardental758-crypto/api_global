const net = require('net');
const { candadosModels } = require('../models');

// Mapa en memoria para almacenar las conexiones de sockets activas por IMEI
const activeSockets = new Map();

/**
 * Función auxiliar para convertir coordenadas en formato NMEA (ddmm.mmmm) a grados decimales estándar
 * hora + minutos/60
 * Ejemplo: Latitud: 0440.03733 Longitud: 07403.96001
 */
function convertNmeaToDecimal(nmeaStr, hemisphere) {
    if (!nmeaStr) return null;
    const parts = nmeaStr.split('.');
    if (parts.length === 2 && parts[0].length >= 3) {
        const hoursMinutesDividerIndex = parts[0].length - 2;
        const hours = parts[0].substring(0, hoursMinutesDividerIndex);
        const minutesStr = nmeaStr.substring(hoursMinutesDividerIndex);
        
        let decimalRepresentation = parseFloat(hours) + (parseFloat(minutesStr) / 60);
        if (hemisphere === 'S' || hemisphere === 'W') {
            decimalRepresentation = decimalRepresentation * -1;
        }
        return parseFloat(decimalRepresentation.toFixed(8));
    }
    return null;
}

/**
 * Envía un comando formateado al candado, anteponiendo la cabecera binaria 0xFFFF (\xff\xff)
 */
function sendToLock(socket, commandStr) {
    try {
        if (!socket || socket.destroyed) {
            console.warn('[LockTCP] Intento de escribir en un socket cerrado o inválido');
            return false;
        }
        const initialPayload = Buffer.from([0xFF, 0xFF]);
        const commandPayload = Buffer.from(commandStr, 'utf8');
        const finalBuffer = Buffer.concat([initialPayload, commandPayload]);
        
        socket.write(finalBuffer);
        console.log(`[LockTCP] Comando enviado a IMEI ${socket.imei || 'desconocido'}: ${commandStr.trim()}`);
        return true;
    } catch (err) {
        console.error(`[LockTCP] Error al enviar comando a IMEI ${socket.imei || 'desconocido'}:`, err.message);
        return false;
    }
}

/**
 * Procesa un mensaje completo recibido del candado (sin el carácter terminador '#')
 */
async function handleLockMessage(socket, rawMessage) {
    const message = rawMessage.trim();
    if (!message) return;

    // Quitar el '#' final si está presente antes de hacer split
    const cleanMessage = message.replace(/#$/, '');
    const receivedItems = cleanMessage.split(',');

    if (receivedItems.length < 5) {
        console.warn(`[LockTCP] Mensaje inválido o incompleto: "${message}"`);
        return;
    }

    const stxFrameHeader = receivedItems[0]; // Ej: *CMDR
    const deviceCode = receivedItems[1];     // Ej: OM
    const imei = receivedItems[2];           // 15 dígitos
    const time = receivedItems[3];           // yyMMddHHmmss
    const commandCode = receivedItems[4];   // Ej: Q0, H0, L0, L1, D0, W0

    // Registrar/actualizar la asociación del socket activo con el IMEI
    if (imei && imei.length === 15) {
        if (!activeSockets.has(imei) || activeSockets.get(imei) !== socket) {
            activeSockets.set(imei, socket);
            socket.imei = imei;
            console.log(`[LockTCP] Conexión registrada/actualizada para IMEI: ${imei}`);
        }
    } else {
        console.warn(`[LockTCP] IMEI inválido o ausente en el comando: "${imei}"`);
        return;
    }

    console.log(`[LockTCP] Mensaje recibido del IMEI ${imei}: CMD=${commandCode} | Tramas: ${cleanMessage}`);

    try {
        switch (commandCode) {
            case 'Q0': {
                // Sign In: *CMDR,OM,<IMEI>,<time>,Q0,<voltage>,<battery%>#
                // receivedItems[5] = voltage, receivedItems[6] = battery%
                const batteryPercent = parseInt(receivedItems[6], 10) || 0;
                
                console.log(`[LockTCP] [Q0 - Sign-in] IMEI: ${imei} | Batería: ${batteryPercent}%`);

                await candadosModels.update({
                    can_bateria: batteryPercent,
                    can_fecha_ultimo_comando: new Date(),
                    can_ultimo_comando: 'Q0'
                }, {
                    where: { can_imei: imei }
                });
                break;
            }

            case 'H0': {
                // Heartbeat: *CMDR,OM,<IMEI>,<time>,H0,<lockStatus>,<voltage>,<signal>,<battery%>,<error>#
                // receivedItems[5] = lockStatus (0=open, 1=closed)
                // receivedItems[7] = signal
                // receivedItems[8] = battery%
                const lockStatus = parseInt(receivedItems[5], 10);
                const signal = parseInt(receivedItems[7], 10) || 0;
                const batteryPercent = parseInt(receivedItems[8], 10) || 0;
                const statusStr = (lockStatus === 0) ? 'open' : 'closed';

                console.log(`[LockTCP] [H0 - Heartbeat] IMEI: ${imei} | Estado: ${statusStr} | Batería: ${batteryPercent}% | Señal: ${signal}`);

                await candadosModels.update({
                    can_estado_candado: statusStr,
                    can_bateria: batteryPercent,
                    can_senal: signal,
                    can_fecha_ultimo_comando: new Date(),
                    can_ultimo_comando: 'H0'
                }, {
                    where: { can_imei: imei }
                });
                break;
            }

            case 'L1': {
                // Lock automático: *CMDR,OM,<IMEI>,<time>,L1,<userID>,<timestamp>,<rideTime>#
                console.log(`[LockTCP] [L1 - Bloqueo manual] IMEI: ${imei} detectó bloqueo manual.`);

                // Responder ACK obligatorio: *CMDS,OM,<IMEI>,000000000000,Re,L1#\n
                const ackCmd = `*CMDS,OM,${imei},000000000000,Re,L1#\n`;
                sendToLock(socket, ackCmd);

                await candadosModels.update({
                    can_estado_candado: 'closed',
                    can_fecha_ultimo_comando: new Date(),
                    can_ultimo_comando: 'L1'
                }, {
                    where: { can_imei: imei }
                });
                break;
            }

            case 'L0': {
                // Respuesta de desbloqueo: *CMDR,OM,<IMEI>,<time>,L0,<result>,<userID>,<timestamp>#
                // receivedItems[5] = result (0=éxito, 1=fallo)
                const result = parseInt(receivedItems[5], 10);
                console.log(`[LockTCP] [L0 - Respuesta desbloqueo] IMEI: ${imei} | Resultado: ${result === 0 ? 'Exito' : 'Fallo'}`);

                // Responder ACK obligatorio: *CMDS,OM,<IMEI>,000000000000,Re,L0#\n
                const ackCmd = `*CMDS,OM,${imei},000000000000,Re,L0#\n`;
                sendToLock(socket, ackCmd);

                if (result === 0) {
                    await candadosModels.update({
                        can_estado_candado: 'open',
                        can_fecha_ultimo_comando: new Date(),
                        can_ultimo_comando: 'L0'
                    }, {
                        where: { can_imei: imei }
                    });
                }
                break;
            }

            case 'D0': {
                // Reporte de posición: *CMDR,OM,<IMEI>,<time>,D0,<type>,<utcTime>,<status>,<lat>,<NS>,<lon>,<EW>,...#
                // receivedItems[8] = latitud (ddmm.mmmm)
                // receivedItems[9] = NS (N/S)
                // receivedItems[10] = longitud (dddmm.mmmm)
                // receivedItems[11] = EW (E/W)
                const latVal = receivedItems[8];
                const latHem = receivedItems[9];
                const lonVal = receivedItems[10];
                const lonHem = receivedItems[11];

                const latDecimal = convertNmeaToDecimal(latVal, latHem);
                const lonDecimal = convertNmeaToDecimal(lonVal, lonHem);

                console.log(`[LockTCP] [D0 - Posición GPS] IMEI: ${imei} | Lat: ${latDecimal} | Lon: ${lonDecimal}`);

                // Responder ACK obligatorio: *CMDS,OM,<IMEI>,000000000000,Re,D0#\n
                const ackCmd = `*CMDS,OM,${imei},000000000000,Re,D0#\n`;
                sendToLock(socket, ackCmd);

                if (latDecimal !== null && lonDecimal !== null) {
                    await candadosModels.update({
                        can_latitud: latDecimal,
                        can_longitud: lonDecimal,
                        can_fecha_ultimo_comando: new Date(),
                        can_ultimo_comando: 'D0'
                    }, {
                        where: { can_imei: imei }
                    });
                }
                break;
            }

            case 'W0': {
                // Alerta: *CMDR,OM,<IMEI>,<time>,W0,<type>#
                // type: 1=Movimiento ilegal, 2=Caída, 3=Desmontaje ilegal...
                const alertType = receivedItems[5];
                console.log(`[LockTCP] [W0 - Alerta] IMEI: ${imei} | Tipo de Alerta: ${alertType}`);

                // Responder ACK obligatorio: *CMDS,OM,<IMEI>,000000000000,Re,W0#\n
                const ackCmd = `*CMDS,OM,${imei},000000000000,Re,W0#\n`;
                sendToLock(socket, ackCmd);

                await candadosModels.update({
                    can_fecha_ultimo_comando: new Date(),
                    can_ultimo_comando: `W0_alert_${alertType}`
                }, {
                    where: { can_imei: imei }
                });
                break;
            }

            default:
                console.log(`[LockTCP] Comando no manejado de forma especial: ${commandCode} | Mensaje: ${cleanMessage}`);
                break;
        }
    } catch (dbErr) {
        console.error(`[LockTCP] Error al interactuar con MySQL para IMEI ${imei}:`, dbErr.message);
    }
}

/**
 * Inicializa y arranca el servidor TCP para los candados
 */
function startLockTcpServer() {
    const port = process.env.LOCK_TCP_PORT || 8888;
    
    const server = net.createServer((socket) => {
        console.log(`[LockTCP] Nueva conexión entrante desde ${socket.remoteAddress}:${socket.remotePort}`);
        
        // Timeout de inactividad de 5 minutos (300 segundos) para liberar sockets zombies
        socket.setTimeout(300000); 
        
        let stringBuffer = '';

        socket.on('data', (chunk) => {
            stringBuffer += chunk.toString('utf8');
            
            let hashIndex;
            // El delimitador de fin de paquete es '#'
            while ((hashIndex = stringBuffer.indexOf('#')) !== -1) {
                const fullPacket = stringBuffer.substring(0, hashIndex + 1);
                stringBuffer = stringBuffer.substring(hashIndex + 1);
                
                // Procesar el comando completo de forma asíncrona
                handleLockMessage(socket, fullPacket).catch((err) => {
                    console.error('[LockTCP] Error procesando paquete:', err.message);
                });
            }
        });

        socket.on('timeout', () => {
            console.log(`[LockTCP] Timeout de inactividad alcanzado para ${socket.imei || 'desconocido'}. Cerrando.`);
            socket.destroy();
        });

        socket.on('error', (err) => {
            console.error(`[LockTCP] Error en socket para IMEI ${socket.imei || 'desconocido'}:`, err.message);
        });

        socket.on('close', () => {
            console.log(`[LockTCP] Conexión cerrada para IMEI: ${socket.imei || 'desconocido'}`);
            if (socket.imei) {
                // Solo remover del mapa si este socket específico es el guardado
                if (activeSockets.get(socket.imei) === socket) {
                    activeSockets.delete(socket.imei);
                }
            }
        });
    });

    server.listen(port, '0.0.0.0', () => {
        console.log(`📡 [LockTCP] Servidor TCP para candados iniciado en el puerto: ${port}`);
    });

    return server;
}

/**
 * Recupera una conexión de socket activa dado su IMEI
 */
function getSocketByImei(imei) {
    return activeSockets.get(imei);
}

module.exports = {
    startLockTcpServer,
    getSocketByImei,
    sendToLock
};
