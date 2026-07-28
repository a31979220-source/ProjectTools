const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),
  openFolder: (folderPath) => ipcRenderer.invoke('shell:open-folder', folderPath),
  readFolderContent: (folderPath) => ipcRenderer.invoke('fs:read-folder', folderPath),
  openFile: (filePath) => ipcRenderer.invoke('fs:open-file', filePath),
  openWith: (itemPath, appName, customExePath) => ipcRenderer.invoke('shell:open-with', { path: itemPath, app: appName, customExePath }),
  getCustomApps: () => ipcRenderer.invoke('store:get-custom-apps'),
  saveCustomApps: (apps) => ipcRenderer.invoke('store:save-custom-apps', apps),
  setTheme: (theme) => ipcRenderer.send('theme:change', theme),
});
