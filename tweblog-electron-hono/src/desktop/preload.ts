import { contextBridge, ipcRenderer } from 'electron'

const desktopAPI = {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  generateTokenAdmin: async (): Promise<string> => await ipcRenderer.invoke('generateTokenAdmin'),
  httpPortIcp: async (): Promise<number> => await ipcRenderer.invoke('httpPortIcp')
}

contextBridge.exposeInMainWorld('desktopAPI', desktopAPI)
