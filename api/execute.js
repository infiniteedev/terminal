const { exec } = require('child_process');

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

        // Check if the command is allowed
        if (!allowedCommands.some(cmd => command.startsWith(cmd))) {
            return res.status(403).send('Command not allowed\nuser@infinitee -$ ');
        }

        // Handle the 'clear' command
        if (command === 'clear') {
            return res.send('user@infinitee -$ '); // Return just the prompt after clearing
        }

        // Execute the command
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).send(`Error: ${error.message}\nuser@infinitee -$ `);
            }
            if (stderr) {
                return res.status(500).send(`Stderr: ${stderr}\nuser@infinitee -$ `);
            }

            // Process output to remove unnecessary newlines
            const output = stdout.replace(/\n{2,}/g, '\n').trim(); // Remove multiple newlines
            const response = output ? output + '\nuser@infinitee -$ ' : 'user@infinitee -$ ';

            res.send(response);
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
