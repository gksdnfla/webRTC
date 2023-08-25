const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const roomTeacherMap = new Map();

io.on('connection', (socket) => {
    console.log('connected!!!', socket.id);
    socket.on("createClassroom", (name, callback) => {
        socket.join(name);

        roomTeacherMap.set(name, socket.id);
    });

    socket.on("joinClassroom", (name) => {
        socket.join(name);

        io.to(roomTeacherMap.get(name)).emit("studentJoinedIn", {studentSid: socket.id});
    });

    socket.on("teacherOffer", data => {
        io.to(data.to).emit("teacherOffer", data);
    });

    socket.on("studentAnswer", data => {
        io.to(data.to).emit("studentAnswer", data);
    });

    socket.on("ice", data => {
        io.to(data.to).emit("ice", data);
    });
});

// Serve static files (HTML, CSS, JavaScript)
app.use(express.static(__dirname + '/public'));

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});