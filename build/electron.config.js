const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let cliProcess;

function createWindow() {
  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'hiddenInset',
    show: false
  });

  // 加载终端界面
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 启动Research CLI进程
    startResearchCLI();
  });

  // 窗口关闭时清理
  mainWindow.on('closed', () => {
    if (cliProcess) {
      cliProcess.kill();
    }
    mainWindow = null;
  });
}

function startResearchCLI() {
  // 启动Research CLI作为子进程
  const cliPath = path.join(__dirname, '../packages/cli/dist/index.js');
  
  cliProcess = spawn('node', [cliPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });

  // 处理CLI输出
  cliProcess.stdout.on('data', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('cli-output', data.toString());
    }
  });

  cliProcess.stderr.on('data', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('cli-error', data.toString());
    }
  });

  cliProcess.on('close', (code) => {
    console.log(`Research CLI process exited with code ${code}`);
  });
}

// IPC处理
ipcMain.on('cli-input', (event, input) => {
  if (cliProcess && cliProcess.stdin) {
    cliProcess.stdin.write(input + '\n');
  }
});

// 应用事件处理
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 安全设置
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
}); 