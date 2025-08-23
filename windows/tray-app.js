const { app, Tray, Menu, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let tray = null;
let mainWindow = null;
let serverProcess = null;

// Keep a global reference of the window object
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'icon.ico'),
    title: 'PlexPreroller'
  });

  // Load the web interface
  mainWindow.loadURL('http://localhost:8088');

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.ico'));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open PlexPreroller',
      click: () => {
        if (mainWindow === null) {
          createWindow();
        } else {
          mainWindow.show();
        }
      }
    },
    {
      label: 'Open in Browser',
      click: () => {
        shell.openExternal('http://localhost:8088');
      }
    },
    { type: 'separator' },
    {
      label: 'Start Server',
      click: () => {
        startServer();
      }
    },
    {
      label: 'Stop Server',
      click: () => {
        stopServer();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        stopServer();
        app.quit();
      }
    }
  ]);

  tray.setToolTip('PlexPreroller');
  tray.setContextMenu(contextMenu);

  // Double-click to open
  tray.on('double-click', () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
}

function startServer() {
  if (serverProcess) {
    console.log('Server already running');
    return;
  }

  const { spawn } = require('child_process');
  const serverPath = path.join(__dirname, 'plexpreroller.exe');
  
  if (fs.existsSync(serverPath)) {
    serverProcess = spawn(serverPath, [], {
      cwd: __dirname,
      stdio: 'pipe'
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      serverProcess = null;
    });

    console.log('Server started');
  } else {
    console.error('Server executable not found');
  }
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
    console.log('Server stopped');
  }
}

app.whenReady().then(() => {
  createTray();
  startServer();
  
  // Create window after a short delay to let server start
  setTimeout(() => {
    createWindow();
  }, 2000);
});

app.on('window-all-closed', () => {
  // Don't quit when all windows are closed, keep tray icon
  if (process.platform !== 'darwin') {
    // app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopServer();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
