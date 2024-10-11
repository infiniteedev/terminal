const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files from the root directory

app.post('/api/execute', (req, res) => {
    const command = req.body.command;

    const allowedCommands = [
        'ls',
        'mkdir',
        'rm',
        'echo',
        'clear',
        'cd'
    ];

    // Check if the command is allowed
    if (!allowedCommands.some(cmd => command.startsWith(cmd))) {
        return res.status(403).send('Command not allowed');
    }

    // Handle the 'clear' command
    if (command === 'clear') {
        return res.send({ clear: true }); // Indicate to clear the output
    }

    // Handle 'cd' command
    if (command.startsWith('cd')) {
        const dir = command.split(' ')[1];
        if (!dir) {
            return res.status(400).send('No directory specified');
        }

        try {
            process.chdir(dir);
            return res.send(`Changed directory to ${process.cwd()}`);
        } catch (err) {
            return res.status(500).send(`Error: ${err.message}`);
        }
    }

    // Execute other commands
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(`Error: ${error.message}`);
        }
        if (stderr) {
            return res.status(500).send(`Stderr: ${stderr}`);
        }

        const output = stdout.trim(); // Remove leading/trailing whitespace
        res.send(output); // Send output as plain text
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
