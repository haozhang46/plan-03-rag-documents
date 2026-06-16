import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("desktop", {
  getApiKeyStatus: () => ipcRenderer.invoke("settings:getApiKey") as Promise<string>,
  setApiKey: (key: string) => ipcRenderer.invoke("settings:setApiKey", key) as Promise<boolean>,
  clearApiKey: () => ipcRenderer.invoke("settings:clearApiKey") as Promise<boolean>,
  getResourceServerUrl: () =>
    ipcRenderer.invoke("settings:getResourceServerUrl") as Promise<string>,
  setResourceServerUrl: (url: string) =>
    ipcRenderer.invoke("settings:setResourceServerUrl", url) as Promise<boolean>,
  getWorkspace: () => ipcRenderer.invoke("workspace:get") as Promise<string>,
  pickWorkspace: () => ipcRenderer.invoke("workspace:pick") as Promise<string>,
  initProject: (dir: string) => ipcRenderer.invoke("project:init", dir) as Promise<string>,
  openProject: (dir: string) => ipcRenderer.invoke("project:open", dir) as Promise<string>,
  getRecentProjects: () => ipcRenderer.invoke("project:recent") as Promise<string[]>,
  getSidecarPort: () => ipcRenderer.invoke("sidecar:port") as Promise<number>,
});

export type DesktopApi = {
  getApiKeyStatus: () => Promise<string>;
  setApiKey: (key: string) => Promise<boolean>;
  clearApiKey: () => Promise<boolean>;
  getResourceServerUrl: () => Promise<string>;
  setResourceServerUrl: (url: string) => Promise<boolean>;
  getWorkspace: () => Promise<string>;
  pickWorkspace: () => Promise<string>;
  initProject: (dir: string) => Promise<string>;
  openProject: (dir: string) => Promise<string>;
  getRecentProjects: () => Promise<string[]>;
  getSidecarPort: () => Promise<number>;
};

declare global {
  interface Window {
    desktop: DesktopApi;
  }
}
