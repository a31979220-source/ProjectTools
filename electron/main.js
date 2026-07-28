const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');

  const win = new BrowserWindow({
    width: 1280,
    height: 830,
    minWidth: 900,
    minHeight: 600,
    title: 'ProjectTools - 本地项目管理与看板',
    icon: iconPath,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  win.setIcon(iconPath);

  const indexPath = path.join(__dirname, '../dist/index.html');
  win.loadFile(indexPath);
}

// IPC Handler: Sync Windows Title Bar theme with app theme
ipcMain.on('theme:change', (_, theme) => {
  if (theme === 'dark') {
    nativeTheme.themeSource = 'dark';
  } else if (theme === 'light') {
    nativeTheme.themeSource = 'light';
  } else {
    nativeTheme.themeSource = 'system';
  }
});

// IPC Handler: Select local directory folder dialog
ipcMain.handle('dialog:select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: '选择项目关联的本地文件夹',
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// IPC Handler: Open folder in Windows File Explorer
ipcMain.handle('shell:open-folder', async (_, folderPath) => {
  if (folderPath) {
    await shell.openPath(folderPath);
    return true;
  }
  return false;
});

// IPC Handler: Read files & subdirectories inside folder
ipcMain.handle('fs:read-folder', async (_, folderPath) => {
  try {
    if (!folderPath || !fs.existsSync(folderPath)) {
      return [];
    }
    const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
    const items = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(folderPath, entry.name);
        let size = 0;
        let updatedAt = new Date().toISOString();
        try {
          const stat = await fs.promises.stat(fullPath);
          size = stat.size;
          updatedAt = stat.mtime.toISOString();
        } catch (e) {}

        const ext = path.extname(entry.name).toLowerCase().replace('.', '');
        return {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          size,
          updatedAt,
          extension: ext,
        };
      })
    );

    // Sort: directories first, then files alphabetically
    return items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (err) {
    console.error('Error reading folder contents:', err);
    return [];
  }
});

// IPC Handler: Open specific file in default Windows app
ipcMain.handle('fs:open-file', async (_, filePath) => {
  if (filePath) {
    await shell.openPath(filePath);
    return true;
  }
  return false;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
