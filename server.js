const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.static('.')); // Serve static files from the root

// Handle command execution
io.on('connection', (socket) => {
    socket.on('execute-command', (command) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                socket.emit('command-response', `Error: ${stderr || error.message}`);
            } else {
                socket.emit('command-response', stdout);
            }
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
