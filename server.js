const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { exec } = require('child_process');
require('dotenv').config();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '/')));

const allowedCommands = [
    'ls', 'pwd', 'whoami', 'date', 'echo',
    'apt update', 'apt upgrade', 'apt install',
    // Add more commands as necessary
];

function isValidCommand(cmd) {
    return allowedCommands.some(allowed => cmd.startsWith(allowed));
}

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('command', (cmd) => {
        if (isValidCommand(cmd)) {
            exec(cmd, { shell: '/bin/bash' }, (error, stdout, stderr) => {
                const output = error ? stderr : stdout;
                socket.emit('output', output.trim() || ''); // Emit trimmed output
            });
        } else {
            socket.emit('output', 'Command not allowed');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
