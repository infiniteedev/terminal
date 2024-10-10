const { exec } = require('child_process');

export default function handler(req, res) {
    if (req.method === 'POST') {
        const command = req.body.command.trim(); // Trim any whitespace

        // Define allowed commands
        const allowedCommands = ['ls', 'mkdir', 'rm', 'echo', 'clear'];

        // Check if the command is allowed
        const isAllowedCommand = allowedCommands.some(cmd => command.startsWith(cmd));
        if (!isAllowedCommand) {
            return res.status(403).send('Command not allowed');
        }

        // Execute the command
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                return res.status(500).send(`Error: ${error.message}`);
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return res.status(500).send(`Stderr: ${stderr}`);
            }
            res.send(stdout);
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
