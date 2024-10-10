const input = document.getElementById('commandInput');
const terminal = document.getElementById('terminal');

input.addEventListener('keypress', async function(e) {
    if (e.key === 'Enter') {
        const command = input.value;
        const newLine = document.createElement('div');
        newLine.textContent = 'user@infiniteedev -$ ' + command;
        terminal.insertBefore(newLine, terminal.querySelector('.terminal-input'));
        input.value = '';

        // Send command to the server
        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ command })
            });

            const result = await response.text();
            const outputLine = document.createElement('div');
            outputLine.textContent = result;
            terminal.insertBefore(outputLine, terminal.querySelector('.terminal-input'));

            // If command is 'clear', clear the terminal display
            if (command.trim() === 'clear') {
                // Clear the entire terminal content except the prompt
                terminal.innerHTML = '';
                terminal.appendChild(document.createElement('div')).textContent = 'user@infiniteedev -$ ';
                input.focus(); // Keep focus on input
            }
        } catch (error) {
            const errorLine = document.createElement('div');
            errorLine.textContent = 'Error executing command: ' + error.message;
            terminal.insertBefore(errorLine, terminal.querySelector('.terminal-input'));
        }
    }
});
