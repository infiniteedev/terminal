<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InfiniteeDev Shell</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #1e1e1e;
            font-family: 'Courier New', Courier, monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .terminal {
            width: 90%;
            height: 85vh;
            margin: 20px;
            border-radius: 20px;
            background-color: #2d2d2d;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .terminal-header {
            display: flex;
            align-items: center;
            background-color: #3b3b3b;
            padding: 15px;
            border-bottom: 2px solid #444;
        }
        .dot { width: 15px; height: 15px; border-radius: 50%; margin-right: 10px; }
        .dot.red { background-color: #ff5f56; }
        .dot.yellow { background-color: #ffbd2e; }
        .dot.green { background-color: #27c93f; }
        .terminal-content {
            flex-grow: 1;
            padding: 20px;
            color: #d1d1d1;
            font-size: 16px;
            line-height: 1.8;
            white-space: pre-line;
            overflow-y: auto;
        }
        .terminal-input {
            display: flex;
            align-items: center;
            color: #00ff00;
        }
        .terminal-input span { margin-right: 8px; }
        .terminal-input input {
            background: none; border: none; color: #00ff00;
            font-family: inherit; font-size: inherit; outline: none; flex-grow: 1;
        }
    </style>
</head>
<body>

<div class="terminal">
    <div class="terminal-header">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
    </div>
    <div class="terminal-content" id="terminal">
        <div class="terminal-input">
            <span>user@infiniteedev -$</span><input type="text" id="commandInput" autofocus>
        </div>
    </div>
</div>

<script>
    const input = document.getElementById('commandInput');
    const terminal = document.getElementById('terminal');

    input.addEventListener('keypress', async function(e) {
        if (e.key === 'Enter') {
            const command = input.value.trim();
            if (!command) return; // Ignore empty commands

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

                const result = await response.text(); // Get response as plain text

                if (result.includes('Command not allowed') || result.includes('Error:')) {
                    const errorLine = document.createElement('div');
                    errorLine.textContent = result;
                    terminal.insertBefore(errorLine, terminal.querySelector('.terminal-input'));
                } else if (result.trim() === '{"clear":true}') {
                    // Clear the terminal content while keeping the input intact
                    const outputLines = terminal.querySelectorAll('div:not(.terminal-input)');
                    outputLines.forEach(line => line.remove());
                } else {
                    const outputLine = document.createElement('div');
                    outputLine.textContent = result; // result is plain text
                    terminal.insertBefore(outputLine, terminal.querySelector('.terminal-input'));
                }
            } catch (error) {
                const errorLine = document.createElement('div');
                errorLine.textContent = 'Error executing command: ' + error.message;
                terminal.insertBefore(errorLine, terminal.querySelector('.terminal-input'));
            }
        }
    });
</script>

</body>
</html>
                
