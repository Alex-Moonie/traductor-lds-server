// server.js

// 1. Importar librerías
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

// Puerto donde se ejecutará el servidor (usamos 3000 por defecto)
const PORT = process.env.PORT || 3000;

// 2. Configurar Socket.io
// Permitimos CORS (*) para que tu Frontend (tu HTML local) pueda conectarse
const io = new Server(server, { 
    cors: { 
        origin: "*", 
        methods: ["GET", "POST"]
    } 
}); 

// 3. Manejar las Conexiones de WebSocket (la lógica del chat)
io.on('connection', (socket) => {
  console.log('Un usuario se conectó con ID:', socket.id);
  
  // Manejador: El usuario se une a una sala con un código (emitido desde el QR)
  socket.on('join_room', (roomCode) => {
    socket.join(roomCode); // Une al socket a la sala con el nombre 'roomCode'
    console.log(`Usuario ${socket.id} se unió a la sala: ${roomCode}`);
    
    // Notifica al otro usuario que alguien se conectó a su sala
    socket.to(roomCode).emit('user_joined', '¡Conexión establecida!');
  });

  // Manejador: Recibir y reenviar mensajes
  socket.on('send_message', (data) => {
    // data debe contener { room: 'codigo_sala', message: 'mensaje_texto' }
    console.log(`Mensaje en sala ${data.room}: ${data.message}`);
    
    // Reenviamos el mensaje a todos en la sala, *excepto* al remitente (por eso usamos socket.to)
    socket.to(data.room).emit('receive_message', data.message);
  });

  // Manejador para la desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// 4. Iniciar el Servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor Socket.io corriendo en http://localhost:${PORT}`);
});
