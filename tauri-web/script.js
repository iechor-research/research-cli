import { invoke } from '@tauri-apps/api/core';

class ResearchCLIApp {
    constructor() {
        this.init();
    }

    async init() {
        this.showLoading();
        await this.startResearchCLI();
        this.setupEventListeners();
    }

    showLoading() {
        const frame = document.getElementById('research-frame');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.textContent = 'Starting Research CLI';
        frame.parentElement.appendChild(loadingDiv);
    }

    hideLoading() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }

    showError(message) {
        this.hideLoading();
        const frame = document.getElementById('research-frame');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.innerHTML = `
            <div>❌ Failed to start Research CLI</div>
            <div style="margin-top: 10px; font-size: 12px; opacity: 0.7;">${message}</div>
            <div style="margin-top: 15px;">
                <button onclick="location.reload()" style="
                    background: #ff6b6b; 
                    color: white; 
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 4px; 
                    cursor: pointer;
                ">Retry</button>
            </div>
        `;
        frame.parentElement.appendChild(errorDiv);
    }

    async startResearchCLI() {
        try {
            // 直接嵌入一个简单的 Research CLI 界面
            await this.embedResearchCLI();
        } catch (error) {
            console.error('Failed to start Research CLI:', error);
            this.showError(error.toString());
        }
    }

    async embedResearchCLI() {
        const frame = document.getElementById('research-frame');
        
        // 创建一个包含 Research CLI 功能的 HTML 页面
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Research CLI</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            color: #fff;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
            height: 100vh;
            overflow: hidden;
        }
        .terminal {
            height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 20px;
            box-sizing: border-box;
        }
        .welcome {
            color: #4fc3f7;
            margin-bottom: 20px;
        }
        .prompt-line {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .prompt {
            color: #4fc3f7;
            margin-right: 8px;
        }
        .input {
            flex: 1;
            background: transparent;
            border: none;
            color: #fff;
            font-family: inherit;
            font-size: 14px;
            outline: none;
        }
        .output {
            flex: 1;
            overflow-y: auto;
            white-space: pre-wrap;
            font-size: 14px;
            line-height: 1.4;
        }
        .command {
            color: #4fc3f7;
        }
        .result {
            color: #d4d4d4;
            margin-bottom: 10px;
        }
        .error {
            color: #ff6b6b;
            margin-bottom: 10px;
        }
        .loading {
            color: #ffbd2e;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body>
    <div class="terminal">
        <div class="welcome">
            ⚡ Research CLI Desktop
            <br>Type 'help' to get started, or try some commands below:
            <br>• research "explain quantum computing"
            <br>• config show
            <br>• models list
        </div>
        <div class="output" id="output"></div>
        <div class="prompt-line">
            <span class="prompt">research$</span>
            <input class="input" id="commandInput" placeholder="Enter your command..." autocomplete="off">
        </div>
    </div>

    <script>
        const output = document.getElementById('output');
        const input = document.getElementById('commandInput');
        let commandHistory = [];
        let historyIndex = -1;

        function addOutput(text, type = 'result') {
            const div = document.createElement('div');
            div.className = type;
            div.textContent = text;
            output.appendChild(div);
            output.scrollTop = output.scrollHeight;
        }

        function showLoading() {
            const div = document.createElement('div');
            div.className = 'loading';
            div.textContent = 'Executing...';
            output.appendChild(div);
            output.scrollTop = output.scrollHeight;
            return div;
        }

        async function executeCommand(command) {
            if (!command.trim()) return;

            // 显示命令
            addOutput('research$ ' + command, 'command');
            
            // 添加到历史
            commandHistory.unshift(command);
            if (commandHistory.length > 50) {
                commandHistory = commandHistory.slice(0, 50);
            }
            historyIndex = -1;

            const loadingDiv = showLoading();

            try {
                // 通过 postMessage 发送命令到父窗口
                window.parent.postMessage({
                    type: 'execute-command',
                    command: command
                }, '*');

                // 模拟一些基本命令
                if (command === 'help') {
                    loadingDiv.remove();
                    addOutput(\`Available commands:
• research "query" - Ask a research question
• config show - Show configuration
• models list - List available models
• clear - Clear the terminal
• help - Show this help\`);
                } else if (command === 'clear') {
                    loadingDiv.remove();
                    output.innerHTML = '';
                } else if (command === 'config show') {
                    loadingDiv.remove();
                    addOutput(\`Configuration:
• Model: Claude 3.5 Sonnet
• Provider: Anthropic
• Max tokens: 4096
• Temperature: 0.7\`);
                } else if (command === 'models list') {
                    loadingDiv.remove();
                    addOutput(\`Available models:
• claude-3-5-sonnet-20241022 (current)
• gpt-4o
• gpt-4o-mini
• deepseek-chat
• qwen-max\`);
                } else if (command.startsWith('research ')) {
                    // 实际的研究命令会通过 Tauri 执行
                    setTimeout(() => {
                        loadingDiv.remove();
                        addOutput('This would execute the research command through the actual Research CLI backend.');
                    }, 1000);
                } else {
                    setTimeout(() => {
                        loadingDiv.remove();
                        addOutput(\`Unknown command: \${command}. Type 'help' for available commands.\`, 'error');
                    }, 500);
                }
            } catch (error) {
                loadingDiv.remove();
                addOutput('Error: ' + error.message, 'error');
            }

            input.value = '';
        }

        // 键盘事件
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                executeCommand(input.value);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    input.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    input.value = commandHistory[historyIndex];
                } else if (historyIndex === 0) {
                    historyIndex = -1;
                    input.value = '';
                }
            }
        });

        // 监听父窗口消息
        window.addEventListener('message', (event) => {
            if (event.data.type === 'command-result') {
                const loadingDiv = output.querySelector('.loading');
                if (loadingDiv) loadingDiv.remove();
                addOutput(event.data.result);
            }
        });

        // 聚焦输入框
        input.focus();

        // 通知父窗口已准备就绪
        window.parent.postMessage({ type: 'research-cli-ready' }, '*');
    </script>
</body>
</html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        frame.src = url;
        
        setTimeout(() => {
            this.hideLoading();
        }, 1000);
    }

    setupEventListeners() {
        // 监听来自 iframe 的消息
        window.addEventListener('message', async (event) => {
            if (event.data.type === 'research-cli-ready') {
                this.hideLoading();
            } else if (event.data.type === 'execute-command') {
                // 执行实际的 Research CLI 命令
                try {
                    const result = await invoke('run_research_command', { 
                        command: event.data.command 
                    });
                    
                    // 发送结果回 iframe
                    const frame = document.getElementById('research-frame');
                    frame.contentWindow.postMessage({
                        type: 'command-result',
                        result: result
                    }, '*');
                } catch (error) {
                    const frame = document.getElementById('research-frame');
                    frame.contentWindow.postMessage({
                        type: 'command-result',
                        result: 'Error: ' + error
                    }, '*');
                }
            }
        });

        // 新标签页按钮
        document.getElementById('new-tab').addEventListener('click', () => {
            console.log('New tab clicked - feature coming soon!');
        });

        // 窗口控制按钮
        document.querySelector('.control-dot.close').addEventListener('click', () => {
            window.close();
        });

        document.querySelector('.control-dot.minimize').addEventListener('click', () => {
            invoke('minimize_window').catch(console.error);
        });

        document.querySelector('.control-dot.maximize').addEventListener('click', () => {
            invoke('toggle_maximize').catch(console.error);
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ResearchCLIApp();
});

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
}); 