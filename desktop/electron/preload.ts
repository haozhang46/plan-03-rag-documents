import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("desktop", {
  getApiKeyStatus: () => ipcRenderer.invoke("settings:getApiKey") as Promise<string>,
  setApiKey: (key: string) => ipcRenderer.invoke("settings:setApiKey", key) as Promise<boolean>,
  clearApiKey: () => ipcRenderer.invoke("settings:clearApiKey") as Promise<boolean>,
  getWorkspace: () => ipcRenderer.invoke("workspace:get") as Promise<string>,
  pickWorkspace: () => ipcRenderer.invoke("workspace:pick") as Promise<string>,
  getSidecarPort: () => ipcRenderer.invoke("sidecar:port") as Promise<number>,
});

export type DesktopApi = {
  getApiKeyStatus: () => Promise<string>;
  setApiKey: (key: string) => Promise<boolean>;
  clearApiKey: () => Promise<boolean>;
  getWorkspace: () => Promise<string>;
  pickWorkspace: () => Promise<string>;
  getSidecarPort: () => Promise<number>;
};

declare global {
  interface Window {
    desktop: DesktopApi;
  }
}
