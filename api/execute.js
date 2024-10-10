const { exec } = require('child_process');

let outputHistory = [];

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
            return res.status(403).send('Command not allowed');
        }

        // Handle the 'clear' command
        if (command === 'clear') {
            outputHistory = []; // Reset output history
            return res.send('user@infinitee -$ '); // Return prompt after clearing
        }

        // Execute the command
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).send(`Error: ${error.message}\nuser@infinitee -$ `);
            }
            if (stderr) {
                return res.status(500).send(`Stderr: ${stderr}\nuser@infinitee -$ `);
            }

            outputHistory.push(stdout); // Store the output
            res.send(stdout + '\nuser@infinitee -$ '); // Append prompt after output
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
