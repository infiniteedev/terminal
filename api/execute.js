const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

export default function handler(req, res) {
    if (req.method === 'POST') {
        const command = req.body.command;

        const allowedCommands = [
            'ls',
            'mkdir',
            'rm',
            'echo',
            'clear'
        ];

        // Prevent removing critical files and directories
        const restrictedFiles = ['api', 'execute.js', 'package.json', 'index.html'];
        const isRestricted = restrictedFiles.some(file => command.includes(file));

        if (isRestricted) {
            return res.status(403).send('Command not allowed: you cannot delete critical files.');
        }

        if (!allowedCommands.some(cmd => command.startsWith(cmd))) {
            return res.status(403).send('Command not allowed');
        }

        if (command === 'clear') {
            return res.send(''); // Clear output
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
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
