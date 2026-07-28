const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),
  openFolder: (folderPath) => ipcRenderer.invoke('shell:open-folder', folderPath),
  readFolderContent: (folderPath) => ipcRenderer.invoke('fs:read-folder', folderPath),
  openFile: (filePath) => ipcRenderer.invoke('fs:open-file', filePath),
  setTheme: (theme) => ipcRenderer.send('theme:change', theme),
});
