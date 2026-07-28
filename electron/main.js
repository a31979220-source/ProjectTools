const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

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

// Permanent File Storage Path in AppData
const getCustomAppsFilePath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'custom-apps.json');
};

// IPC Handler: Read custom apps list from disk
ipcMain.handle('store:get-custom-apps', async () => {
  try {
    const filePath = getCustomAppsFilePath();
    if (fs.existsSync(filePath)) {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading custom apps from disk:', err);
  }
  return [];
});

// IPC Handler: Save custom apps list to disk
ipcMain.handle('store:save-custom-apps', async (_, apps) => {
  try {
    const filePath = getCustomAppsFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, JSON.stringify(apps, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving custom apps to disk:', err);
    return false;
  }
});

// Helper: Extract real product name and native icon from executable file
async function getExeInfo(exePath) {
  let iconDataUrl = null;
  try {
    const icon = await app.getFileIcon(exePath, { size: 'normal' });
    if (icon && !icon.isEmpty()) {
      iconDataUrl = icon.toDataURL();
    }
  } catch (e) {}

  let rawName = path.basename(exePath, path.extname(exePath));
  const nameMap = {
    idea64: 'IntelliJ IDEA',
    idea: 'IntelliJ IDEA',
    pycharm64: 'PyCharm',
    pycharm: 'PyCharm',
    webstorm64: 'WebStorm',
    webstorm: 'WebStorm',
    clion64: 'CLion',
    clion: 'CLion',
    rider64: 'Rider',
    rider: 'Rider',
    goland64: 'GoLand',
    goland: 'GoLand',
    datagrip64: 'DataGrip',
    datagrip: 'DataGrip',
    code: 'VS Code',
    cursor: 'Cursor IDE',
    sublime_text: 'Sublime Text',
    notepad: '记事本',
    'notepad++': 'Notepad++',
    typora: 'Typora',
    winword: 'Microsoft Word',
    excel: 'Microsoft Excel',
    powerpnt: 'Microsoft PowerPoint',
    chrome: 'Google Chrome',
    msedge: 'Microsoft Edge',
    cmd: 'CMD 命令行终端',
  };

  const lowerBase = rawName.toLowerCase();
  let exeName = nameMap[lowerBase];

  if (!exeName) {
    try {
      const { execSync } = require('child_process');
      const stdout = execSync(`powershell -command "(Get-Item '${exePath}').VersionInfo.FileDescription"`, { encoding: 'utf8', timeout: 2000 }).trim();
      if (stdout && stdout.length > 0 && stdout.length < 40) {
        exeName = stdout;
      }
    } catch (e) {}
  }

  if (!exeName) {
    exeName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  }

  return { exeName, iconDataUrl };
}

// IPC Handler: Open with specific app (VS Code, Word, Excel, PPT, Terminal, Custom EXE, etc.)
ipcMain.handle('shell:open-with', async (_, { path: itemPath, app: appName, customExePath }) => {
  if (!itemPath) return { success: false };

  try {
    if (customExePath) {
      exec(`"${customExePath}" "${itemPath}"`);
      return { success: true, exePath: customExePath };
    }
    if (appName === 'vscode') {
      exec(`code "${itemPath}"`);
      return { success: true };
    }
    if (appName === 'terminal') {
      exec(`start cmd /k "cd /d \"${itemPath}\""`);
      return { success: true };
    }
    if (appName === 'word') {
      exec(`start winword "${itemPath}"`, (err) => {
        if (err) shell.openPath(itemPath);
      });
      return { success: true };
    }
    if (appName === 'excel') {
      exec(`start excel "${itemPath}"`, (err) => {
        if (err) shell.openPath(itemPath);
      });
      return { success: true };
    }
    if (appName === 'ppt') {
      exec(`start powerpnt "${itemPath}"`, (err) => {
        if (err) shell.openPath(itemPath);
      });
      return { success: true };
    }
    if (appName === 'notepad') {
      exec(`notepad "${itemPath}"`);
      return { success: true };
    }
    if (appName === 'other') {
      exec(`OpenWith.exe "${itemPath}"`, (err) => {
        if (err) {
          exec(`rundll32.exe shell32.dll,OpenAs_RunDLL ${itemPath}`);
        }
      });
      return { success: true };
    }
    if (appName === 'browse-exe') {
      const result = await dialog.showOpenDialog({
        title: '选择用于打开此路径的可执行程序 (.exe)',
        properties: ['openFile'],
        filters: [
          { name: '可执行程序 (*.exe)', extensions: ['exe'] },
          { name: '所有文件 (*.*)', extensions: ['*'] }
        ]
      });
      if (!result.canceled && result.filePaths.length > 0) {
        const exePath = result.filePaths[0];
        exec(`"${exePath}" "${itemPath}"`);
        const { exeName, iconDataUrl } = await getExeInfo(exePath);
        return { success: true, exePath, exeName, iconDataUrl };
      }
      return { success: false };
    }

    // Default system handler
    await shell.openPath(itemPath);
    return { success: true };
  } catch (err) {
    console.error('Error opening with app:', err);
    await shell.openPath(itemPath);
    return { success: false };
  }
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
