const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const allowedCommands = [
    'ls',
    'mkdir',
    'rm',
    'apt update',
    'apt upgrade',
    'apt install'
];

app.post('/execute', (req, res) => {
    const command = req.body.command;

    // Check if command is allowed
    if (!allowedCommands.some(cmd => command.startsWith(cmd))) {
        return res.status(403).send('Command not allowed');
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(`Error: ${error.message}`);
        }
        if (stderr) {
            return res.status(500).send(`Stderr: ${stderr}`);
        }
        res.send(stdout);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
