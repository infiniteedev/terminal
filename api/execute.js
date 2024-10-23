const express = require('express');
const { exec } = require('child_process');
const session = require('express-session');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Session middleware configuration
app.use(session({
    secret: 'rizzler-cloud.online', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // Session expires in 1 hour
}));

// Middleware to ensure session state
app.use((req, res, next) => {
    if (!req.session.currentDir) {
        req.session.currentDir = process.cwd(); // Set initial directory
    }
    next();
});

// Main command handler
app.post('/terminal', (req, res) => {
    const command = req.body.command;

    const allowedCommands = [
        'ls', 'mkdir', 'rm', 'echo', 'clear', 'cd',
        'touch', 'cat', 'chmod', 'cp', 'mv', 'rmdir',
        'apt update', 'apt upgrade', 'apt install', 'apt remove',
        'ps', 'kill', 'top', 'df', 'du', 'free',
        'grep', 'find', 'ping', 'uname', 'whoami',
        'pwd', 'history', 'man', 'which', 'locate',
        'nano', 'less', 'head', 'tail', 'wget', 'curl'
    ];

    // Check if the command is allowed
    if (!allowedCommands.some(cmd => command.startsWith(cmd))) {
        return res.status(403).send('Command not allowed');
    }

    // Handle 'clear' command separately
    if (command === 'clear') {
        return res.send({ clear: true });
    }

    // Handle 'cd' command to change directories
    if (command.startsWith('cd')) {
        const dir = command.split(' ')[1];
        if (!dir) {
            return res.status(400).send('No directory specified');
        }

        try {
            // Change session-based directory, not the global process directory
            req.session.currentDir = path.resolve(req.session.currentDir, dir);
            return res.send(`Changed directory to ${req.session.currentDir}`);
        } catch (err) {
            return res.status(500).send(`Error: ${err.message}`);
        }
    }

    // Execute other commands using the session's current directory
    exec(command, { cwd: req.session.currentDir }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(`Error: ${error.message}`);
        }
        if (stderr) {
            return res.status(500).send(`Stderr: ${stderr}`);
        }

        const output = stdout.trim();
        res.send(output);
    });
});

// Ensure session resets on exit
app.use((req, res, next) => {
    res.on('finish', () => {
        if (!req.session) {
            req.session.destroy(); // Clear the session when the user leaves
        }
    });
    next();
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
