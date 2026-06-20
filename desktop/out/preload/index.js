"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("desktop", {
  getApiKeyStatus: () => electron.ipcRenderer.invoke("settings:getApiKey"),
  setApiKey: (key) => electron.ipcRenderer.invoke("settings:setApiKey", key),
  clearApiKey: () => electron.ipcRenderer.invoke("settings:clearApiKey"),
  getResourceServerUrl: () => electron.ipcRenderer.invoke("settings:getResourceServerUrl"),
  setResourceServerUrl: (url) => electron.ipcRenderer.invoke("settings:setResourceServerUrl", url),
  getLangflowBaseUrl: () => electron.ipcRenderer.invoke("settings:getLangflowBaseUrl"),
  getLangflowApiKeyStatus: () => electron.ipcRenderer.invoke("settings:getLangflowApiKeyStatus"),
  setLangflow: (baseUrl, apiKey) => electron.ipcRenderer.invoke("settings:setLangflow", baseUrl, apiKey),
  getLangflowAutoStart: () => electron.ipcRenderer.invoke("settings:getLangflowAutoStart"),
  setLangflowAutoStart: (enabled) => electron.ipcRenderer.invoke("settings:setLangflowAutoStart", enabled),
  getAgentRecursionLimit: () => electron.ipcRenderer.invoke("settings:getAgentRecursionLimit"),
  setAgentRecursionLimit: (payload) => electron.ipcRenderer.invoke("settings:setAgentRecursionLimit", payload),
  restartLangflow: () => electron.ipcRenderer.invoke("langflow:restart"),
  getWorkspace: () => electron.ipcRenderer.invoke("workspace:get"),
  pickWorkspace: () => electron.ipcRenderer.invoke("workspace:pick"),
  pickProjectDirectory: () => electron.ipcRenderer.invoke("project:pickDirectory"),
  initProject: (dir) => electron.ipcRenderer.invoke("project:init", dir),
  openProject: (dir) => electron.ipcRenderer.invoke("project:open", dir),
  getRecentProjects: () => electron.ipcRenderer.invoke("project:recent"),
  getSidecarPort: () => electron.ipcRenderer.invoke("sidecar:port")
});
