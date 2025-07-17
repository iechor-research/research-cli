import { invoke } from '@tauri-apps/api/core';

class ResearchCLIApp {
    constructor() {
        this.commandHistory = [];
        this.currentHistoryIndex = -1;
        this.isExecuting = false;
        
        this.init();
    }

    async init() {
        await this.loadVersion();
        this.setupEventListeners();
        this.loadRecentCommands();
        this.focusInput();
    }

    async loadVersion() {
        try {
            const version = await invoke('get_research_version');
            document.getElementById('version-info').textContent = `v${version}`;
        } catch (error) {
            console.error('Failed to load version:', error);
            document.getElementById('version-info').textContent = 'v0.2.1';
        }
    }

    setupEventListeners() {
        const commandInput = document.getElementById('command-input');
        const executeBtn = document.getElementById('execute-btn');
        const actionBtns = document.querySelectorAll('.action-btn');

        // Execute command on Enter key
        commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.isExecuting) {
                this.executeCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down');
            }
        });

        // Execute command on button click
        executeBtn.addEventListener('click', () => {
            if (!this.isExecuting) {
                this.executeCommand();
            }
        });

        // Quick action buttons
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.getAttribute('data-command');
                commandInput.value = command;
                this.executeCommand();
            });
        });
    }

    async executeCommand() {
        const commandInput = document.getElementById('command-input');
        const executeBtn = document.getElementById('execute-btn');
        const outputArea = document.getElementById('output-area');
        
        const command = commandInput.value.trim();
        if (!command) return;

        // Update UI state
        this.isExecuting = true;
        executeBtn.disabled = true;
        executeBtn.textContent = 'Executing...';

        // Add command to history
        this.addToHistory(command);
        
        // Display command in output
        this.addOutput(`research$ ${command}`, 'command');

        try {
            // Show loading indicator
            const loadingDiv = this.addOutput('Executing command...', 'loading');

            // Execute command via Tauri
            const result = await invoke('run_research_command', { command });
            
            // Remove loading indicator
            loadingDiv.remove();
            
            // Display result
            this.addOutput(result, 'success');
            
        } catch (error) {
            // Remove loading indicator if it exists
            const loadingDiv = outputArea.querySelector('.loading');
            if (loadingDiv) loadingDiv.remove();
            
            // Display error
            this.addOutput(`Error: ${error}`, 'error');
        } finally {
            // Reset UI state
            this.isExecuting = false;
            executeBtn.disabled = false;
            executeBtn.textContent = 'Execute';
            commandInput.value = '';
            this.currentHistoryIndex = -1;
            
            // Scroll to bottom
            outputArea.scrollTop = outputArea.scrollHeight;
        }
    }

    addOutput(text, type = 'normal') {
        const outputArea = document.getElementById('output-area');
        const outputDiv = document.createElement('div');
        outputDiv.className = `command-output ${type}`;
        outputDiv.textContent = text;
        
        // Remove welcome message if it exists
        const welcomeMessage = outputArea.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        outputArea.appendChild(outputDiv);
        outputArea.scrollTop = outputArea.scrollHeight;
        
        return outputDiv;
    }

    addToHistory(command) {
        // Avoid duplicate consecutive commands
        if (this.commandHistory[0] !== command) {
            this.commandHistory.unshift(command);
            
            // Limit history to 50 commands
            if (this.commandHistory.length > 50) {
                this.commandHistory = this.commandHistory.slice(0, 50);
            }
            
            this.saveRecentCommands();
            this.updateRecentCommandsUI();
        }
    }

    navigateHistory(direction) {
        const commandInput = document.getElementById('command-input');
        
        if (direction === 'up') {
            if (this.currentHistoryIndex < this.commandHistory.length - 1) {
                this.currentHistoryIndex++;
                commandInput.value = this.commandHistory[this.currentHistoryIndex];
            }
        } else if (direction === 'down') {
            if (this.currentHistoryIndex > 0) {
                this.currentHistoryIndex--;
                commandInput.value = this.commandHistory[this.currentHistoryIndex];
            } else if (this.currentHistoryIndex === 0) {
                this.currentHistoryIndex = -1;
                commandInput.value = '';
            }
        }
    }

    saveRecentCommands() {
        try {
            localStorage.setItem('research-cli-history', JSON.stringify(this.commandHistory.slice(0, 10)));
        } catch (error) {
            console.error('Failed to save command history:', error);
        }
    }

    loadRecentCommands() {
        try {
            const saved = localStorage.getItem('research-cli-history');
            if (saved) {
                this.commandHistory = JSON.parse(saved);
                this.updateRecentCommandsUI();
            }
        } catch (error) {
            console.error('Failed to load command history:', error);
        }
    }

    updateRecentCommandsUI() {
        const recentList = document.getElementById('recent-list');
        recentList.innerHTML = '';

        const recentCommands = this.commandHistory.slice(0, 5);
        
        if (recentCommands.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'recent-item';
            emptyDiv.textContent = 'No recent commands';
            emptyDiv.style.opacity = '0.5';
            recentList.appendChild(emptyDiv);
            return;
        }

        recentCommands.forEach(command => {
            const recentDiv = document.createElement('div');
            recentDiv.className = 'recent-item';
            recentDiv.textContent = command;
            recentDiv.addEventListener('click', () => {
                document.getElementById('command-input').value = command;
                this.focusInput();
            });
            recentList.appendChild(recentDiv);
        });
    }

    focusInput() {
        document.getElementById('command-input').focus();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResearchCLIApp();
});

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('command-input').focus();
    }
    
    // Ctrl/Cmd + L to clear output
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        const outputArea = document.getElementById('output-area');
        outputArea.innerHTML = '<div class="welcome-message"><p>Terminal cleared</p></div>';
    }
}); 