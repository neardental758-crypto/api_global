const net = require('net');
const { candadosModels, tarjetasNfcModels, prestamosModels, prestamosRutaModels, bicicletasModels, estacionModels, empresaModels } = require('../models');

/**
 * Mapea el candado de la base de datos MySQL a la estructura Loopback JSON esperada por el Frontend Angular
 */
async function mapCandadoToFrontend(candado) {
    const json = candado.toJSON ? candado.toJSON() : candado;
    
    const mapped = {
        id: json.can_id,
        imei: json.can_imei,
        qrNumber: json.can_qr_numero || "",
        mac: json.can_mac || "",
        battery: json.can_bateria !== undefined ? String(json.can_bateria) : "0",
        lockStatus: json.can_estado_candado || "closed",
        signal: json.can_senal !== undefined ? String(json.can_senal) : "0",
        simNumber: json.can_numero_sim || "",
        lastCommandDate: json.can_fecha_ultimo_comando || null,
        lastCommand: json.can_ultimo_comando || "",
        latitude: json.can_latitud !== undefined && json.can_latitud !== null ? parseFloat(json.can_latitud) : null,
        longitude: json.can_longitud !== undefined && json.can_longitud !== null ? parseFloat(json.can_longitud) : null,
        bikeId: json.can_bicicleta || null,
        bike: null,
        organization: {
            id: "",
            name: "Ninguna"
        }
    };

    if (json.bike) {
        mapped.bike = {
            id: json.bike.bic_id,
            nombre: json.bike.bic_nombre,
            number: json.bike.bic_numero,
            estacion: json.bike.bic_estacion,
            estado: json.bike.bic_estado,
            descripcion: json.bike.bic_descripcion
        };

        if (json.bike.bic_estacion) {
            try {
                const station = await estacionModels.findOne({
                    where: { est_estacion: json.bike.bic_estacion }
                });
                if (station && station.est_empresa) {
                    mapped.organization.name = station.est_empresa;
                    const company = await empresaModels.findOne({
                        where: { emp_nombre: station.est_empresa }
                    });
                    if (company) {
                        mapped.organization.id = company.emp_id;
                    }
                }
            } catch (err) {
                console.error("Error retrieving company/station for lock mapping in lockTcpService:", err);
            }
        }
    }

    return mapped;
}

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
            socket.deviceCode = deviceCode;
            console.log(`[LockTCP] Conexión registrada/actualizada para IMEI: ${imei}`);
        } else {
            socket.deviceCode = deviceCode;
        }
    } else {
        console.warn(`[LockTCP] IMEI inválido o ausente en el comando: "${imei}"`);
        return;
    }

    // Auto-creación de candado si no existe en la base de datos
    try {
        let candado = await candadosModels.findOne({ where: { can_imei: imei } });
        if (!candado) {
            console.log(`[LockTCP] Candado con IMEI ${imei} no existe. Creando registro automático...`);
            const can_id = `can_${imei}`;
            
            candado = await candadosModels.create({
                can_id: can_id,
                can_imei: imei,
                can_qr_numero: `QR-${imei.substring(9)}`, // Sugerido usando los últimos dígitos
                can_mac: '',
                can_numero_sim: '',
                can_iccid: '',
                can_estado_candado: 'closed',
                can_bateria: 0,
                can_senal: 0,
                can_fecha_ultimo_comando: new Date(),
                can_ultimo_comando: 'AUTO_CREATE',
                can_bicicleta: null, // Asignar null si se permite, u otra forma
                can_created_at: new Date(),
                can_updated_at: new Date()
            });
            console.log(`[LockTCP] Registro de candado creado automáticamente con ID: ${can_id}`);
        }
    } catch (dbCreateErr) {
        console.error(`[LockTCP] Error al auto-crear el candado con IMEI ${imei}:`, dbCreateErr.message);
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

                // Responder ACK obligatorio: *CMDS,<deviceCode>,<IMEI>,000000000000,Re,L1#\n
                const ackCmd = `*CMDS,${deviceCode},${imei},000000000000,Re,L1#\n`;
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

                // Responder ACK obligatorio: *CMDS,<deviceCode>,<IMEI>,000000000000,Re,L0#\n
                const ackCmd = `*CMDS,${deviceCode},${imei},000000000000,Re,L0#\n`;
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

                // Responder ACK obligatorio: *CMDS,<deviceCode>,<IMEI>,000000000000,Re,D0#\n
                const ackCmd = `*CMDS,${deviceCode},${imei},000000000000,Re,D0#\n`;
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

                    // 1. Buscar el candado para obtener la bicicleta asignada
                    const candadoObj = await candadosModels.findOne({ where: { can_imei: imei } });
                    if (candadoObj && candadoObj.can_bicicleta) {
                        // 2. Buscar si hay un viaje activo para esta bicicleta
                        const activeTrip = await prestamosModels.findOne({
                            where: {
                                pre_bicicleta: candadoObj.can_bicicleta,
                                pre_estado: 'ACTIVA',
                                pre_modulo: '5g'
                            }
                        });

                        if (activeTrip) {
                            // 3. Buscar si ya existe un registro de ruta para este préstamo
                            let prestamoRuta = await prestamosRutaModels.findOne({
                                where: { pr_prestamo_id: activeTrip.pre_id }
                            });

                            let currentCoords = [];
                            if (prestamoRuta && prestamoRuta.pr_ruta) {
                                try {
                                    currentCoords = JSON.parse(prestamoRuta.pr_ruta);
                                } catch (e) {
                                    console.error('[LockTCP] Error parsing pr_ruta JSON:', e.message);
                                }
                            }

                            // Añadir la nueva coordenada
                            const newCoord = {
                                latitude: latDecimal,
                                longitude: lonDecimal,
                                timestamp: new Date().toISOString()
                            };

                            // Evitar duplicar la misma coordenada consecutivamente
                            const lastCoord = currentCoords[currentCoords.length - 1];
                            if (!lastCoord || lastCoord.latitude !== latDecimal || lastCoord.longitude !== lonDecimal) {
                                currentCoords.push(newCoord);

                                if (prestamoRuta) {
                                    await prestamosRutaModels.update({
                                        pr_ruta: JSON.stringify(currentCoords)
                                    }, {
                                        where: { pr_id: prestamoRuta.pr_id }
                                    });
                                } else {
                                    await prestamosRutaModels.create({
                                        pr_prestamo_id: activeTrip.pre_id,
                                        pr_ruta: JSON.stringify(currentCoords)
                                    });
                                }
                                console.log(`[LockTCP] Ruta actualizada para viaje 5G ID: ${activeTrip.pre_id} | Total puntos: ${currentCoords.length}`);
                            }
                        }
                    }
                }
                break;
            }

            case 'W0': {
                // Alerta: *CMDR,OM,<IMEI>,<time>,W0,<type>#
                // type: 1=Movimiento ilegal, 2=Caída, 3=Desmontaje ilegal...
                const alertType = receivedItems[5];
                console.log(`[LockTCP] [W0 - Alerta] IMEI: ${imei} | Tipo de Alerta: ${alertType}`);

                // Responder ACK obligatorio: *CMDS,<deviceCode>,<IMEI>,000000000000,Re,W0#\n
                const ackCmd = `*CMDS,${deviceCode},${imei},000000000000,Re,W0#\n`;
                sendToLock(socket, ackCmd);

                await candadosModels.update({
                    can_fecha_ultimo_comando: new Date(),
                    can_ultimo_comando: `W0_alert_${alertType}`
                }, {
                    where: { can_imei: imei }
                });
                break;
            }

            case 'C0': {
                // Solicitud de desbloqueo por tarjeta RFID swipeda en el candado:
                // *CMDR,OM,<IMEI>,000000000000,C0,0,0,<RFID_HEX>#
                const rfidHex = receivedItems[7] ? receivedItems[7].trim().toUpperCase() : null;
                console.log(`[LockTCP] [C0 - Solicitud de Apertura RFID] IMEI: ${imei} | RFID Hex: ${rfidHex}`);

                if (!rfidHex) {
                    console.warn(`[LockTCP] [C0] No se recibió RFID_HEX en la trama.`);
                    break;
                }

                // 1. Validar la tarjeta en la base de datos (debe estar activa)
                // Hacemos la consulta extremadamente robusta quitando ceros iniciales y caracteres especiales
                const { Op } = require('sequelize');
                const cleanRfidHex = rfidHex.replace(/[^A-Fa-f0-9]/g, '').toUpperCase().replace(/^0+/, '');

                const tarjeta = await tarjetasNfcModels.findOne({
                    where: {
                        tnfc_estado: 'Active',
                        [Op.or]: [
                            { tnfc_id_hexadecimal: rfidHex },
                            { tnfc_id_hexadecimal: cleanRfidHex },
                            { tnfc_id_hexadecimal: { [Op.like]: `%${cleanRfidHex}` } }
                        ]
                    }
                });

                if (!tarjeta) {
                    console.warn(`[LockTCP] [C0] Tarjeta RFID ${rfidHex} no encontrada o inactiva en el sistema.`);
                    break;
                }

                console.log(`[LockTCP] [C0] Tarjeta RFID ${rfidHex} válida. Usuario asociado: ${tarjeta.tnfc_usuario_id}`);

                // 2. Disparar el comando L0 para desbloquear el candado
                const timestamp = Math.floor(Date.now() / 1000);
                const unlockCommand = `*CMDS,${deviceCode},${imei},000000000000,L0,0,0,${timestamp}#\n`;
                
                const sent = sendToLock(socket, unlockCommand);
                if (sent) {
                    console.log(`[LockTCP] [C0] Comando L0 enviado exitosamente para IMEI ${imei} tras swipe de tarjeta RFID.`);
                    // 3. Registrar en DB el comando de apertura disparado por RFID
                    await candadosModels.update({
                        can_fecha_ultimo_comando: new Date(),
                        can_ultimo_comando: `C0_RFID_unlock_${rfidHex}`
                    }, {
                        where: { can_imei: imei }
                    });
                } else {
                    console.error(`[LockTCP] [C0] Error al enviar comando L0 tras swipe de tarjeta RFID.`);
                }
                break;
            }

            case 'I0': {
                // Get SIM ICCID: *CMDR,OM,<IMEI>,<time>,I0,<iccid>#
                const iccid = receivedItems[5] ? receivedItems[5].trim() : '';
                console.log(`[LockTCP] [I0 - ICCID] IMEI: ${imei} | ICCID: ${iccid}`);

                // Responder ACK obligatorio: *CMDS,<deviceCode>,<IMEI>,000000000000,Re,I0#\n
                const ackCmd = `*CMDS,${deviceCode},${imei},000000000000,Re,I0#\n`;
                sendToLock(socket, ackCmd);

                await candadosModels.update({
                    can_iccid: iccid,
                    can_fecha_ultimo_comando: new Date(),
                    can_ultimo_comando: 'I0'
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

    // Emitir actualización por Socket.io en tiempo real para el Dashboard
    try {
        const io = require('./socketIoService').getIo();
        if (io) {
            const updatedCandado = await candadosModels.findOne({
                where: { can_imei: imei },
                include: {
                    model: bicicletasModels,
                    as: 'bike'
                }
            });
            if (updatedCandado) {
                const mapped = await mapCandadoToFrontend(updatedCandado);
                io.emit('lock_update', mapped);
            }
        }
    } catch (socketIoErr) {
        console.error('[LockTCP] Error al emitir actualización vía Socket.io:', socketIoErr.message);
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
