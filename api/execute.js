const { exec } = require('child_process');
const path = require('path');

export default function handler(req, res) {
    if (req.method === 'POST') {
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
            return res.status(403).send('Command not allowed\nuser@infinitee -$ ');
        }

        // Handle the 'clear' command
        if (command === 'clear') {
            return res.send('user@infinitee -$ '); // Return just the prompt after clearing
        }

        // Handle 'cd' command
        if (command.startsWith('cd')) {
            const dir = command.split(' ')[1];
            if (!dir) {
                return res.status(400).send('No directory specified\nuser@infinitee -$ ');
            }

            try {
                process.chdir(dir);
                return res.send(`Changed directory to ${process.cwd()}\nuser@infinitee -$ `);
            } catch (err) {
                return res.status(500).send(`Error: ${err.message}\nuser@infinitee -$ `);
            }
        }

        // Execute other commands
        exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).send(`Error: ${error.message}\nuser@infinitee -$ `);
            }
            if (stderr) {
                return res.status(500).send(`Stderr: ${stderr}\nuser@infinitee -$ `);
            }

            // Process output to remove unnecessary newlines
            const output = stdout.replace(/\n{2,}/g, '\n').trim(); // Remove multiple newlines
            const response = output.length > 0 ? `${output}\n` : ''; // Only include output if present

            res.send(response + 'user@infinitee -$ '); // Append prompt at the end
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
