const express = require('express');
const { exec } = require('child_process');
const session = require('express-session');
const path = require('path');
const fs = require('fs'); // File system module for handling file operations
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set root directory for static files (for serving index.html and others)
const rootDir = path.resolve(__dirname, '..'); // Go one directory up from 'api' folder

// Serve static files (HTML, CSS, JS) from the root directory
app.use(express.static(rootDir));

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

// Command handler
app.post('/terminal', (req, res) => {
    const command = req.body.command.trim(); // Ensure command is trimmed

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
            const newDir = path.resolve(req.session.currentDir, dir);
            if (fs.existsSync(newDir) && fs.lstatSync(newDir).isDirectory()) {
                req.session.currentDir = newDir;
                return res.send(`Changed directory to ${newDir}`);
            } else {
                return res.status(404).send('Directory not found');
            }
        } catch (err) {
            return res.status(500).send(`Error: ${err.message}`);
        }
    }

    // Special handling for 'touch' and 'mkdir'
    if (command.startsWith('touch')) {
        const fileName = command.split(' ')[1];
        if (!fileName) {
            return res.status(400).send('No file name specified');
        }

        const filePath = path.join(req.session.currentDir, fileName);
        // Create an empty file using fs
        fs.writeFile(filePath, '', (err) => {
            if (err) {
                return res.status(500).send(`Error: ${err.message}`);
            }
            return res.send(`File ${fileName} created successfully`);
        });
        return;
    }

    if (command.startsWith('mkdir')) {
        const dirName = command.split(' ')[1];
        if (!dirName) {
            return res.status(400).send('No directory name specified');
        }

        const dirPath = path.join(req.session.currentDir, dirName);
        // Create directory using fs
        fs.mkdir(dirPath, { recursive: true }, (err) => {
            if (err) {
                return res.status(500).send(`Error: ${err.message}`);
            }
            return res.send(`Directory ${dirName} created successfully`);
        });
        return;
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

// Serve index.html when accessing the root
app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
        
