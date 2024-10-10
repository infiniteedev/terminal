const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Allowed commands
const allowedCommands = {
    'ls': true,
    'pwd': true,
    'mkdir': true,
    'rm': true,
    'apt': true, // Allow 'apt' commands with care
};

// Handle command execution
app.post('/execute', (req, res) => {
    const command = req.body.command;
    
    // Simple command validation
    const [cmd, ...args] = command.split(' ');
    
    if (!(cmd in allowedCommands)) {
        return res.json({ output: `Command '${cmd}' is not allowed.` });
    }

    // Only allow specific apt commands
    if (cmd === 'apt') {
        const subCommand = args[0];
        if (!['update', 'upgrade', 'install', 'remove'].includes(subCommand)) {
            return res.json({ output: `apt command '${subCommand}' is not allowed.` });
        }
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.json({ output: `Error: ${stderr || error.message}` });
        }
        res.json({ output: stdout });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
