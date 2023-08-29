const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const roomTeacherMap = new Map();

let roomMaster = null;

io.on('connection', (socket) => {
    socket.on('createRoom', () => {
        console.log('create room', socket.id);
        roomMaster = socket.id;
    });

    socket.on('joinRoom', () => {
        console.log('room master', roomMaster)
        if(roomMaster)
            io.to(roomMaster).emit('joinedRoom', { viewerId: socket.id });
    });

    socket.on('transferIce', data => {
        io.to(data.to).emit('receiveIce', data);
    });

    socket.on('transferOffer', data => {
        io.to(data.to).emit('receiveOffer', data);
    });

    socket.on('transferAnswer', data => {
        io.to(data.to).emit('receiveAnswer', data);
    });

    socket.on('disconnect', () => {
        if(socket.id === roomMaster) roomMaster = null;
    });
});

// Serve static files (HTML, CSS, JavaScript)
app.use(express.static(__dirname + '/public'));

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});