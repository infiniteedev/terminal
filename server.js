const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('command', (cmd) => {
        exec(cmd, (error, stdout, stderr) => {
            const output = error ? stderr : stdout;
            socket.emit('output', output);
        });
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
