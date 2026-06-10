let io = null;

/**
 * Inicializa Socket.io con el servidor HTTP de Express
 */
function initSocketIo(httpServer) {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
        allowEIO3: true,
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`[SocketIO] Nuevo cliente web conectado: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`[SocketIO] Cliente web desconectado: ${socket.id}`);
        });
    });

    return io;
}

/**
 * Retorna la instancia global del servidor Socket.io
 */
function getIo() {
    return io;
}

module.exports = {
    initSocketIo,
    getIo
};
