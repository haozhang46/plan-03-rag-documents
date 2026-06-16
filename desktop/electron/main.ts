import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import { startExecutorServer } from "./executor/server";
import { clearApiKey, loadApiKey, saveApiKey } from "./settings/keychain";

const SIDECAR_PORT = 8765;
const EXECUTOR_PORT = 17351;

let sidecar: ChildProcessWithoutNullStreams | null = null;
let workspaceRoot = process.cwd();

function backendDir(): string {
  return path.resolve(__dirname, "../../../backend");
}

function pythonBin(): string {
  return process.env.PYTHON || "python3";
}

function spawnSidecar(): void {
  if (sidecar) {
    sidecar.kill();
    sidecar = null;
  }

  const key = loadApiKey();
  if (!key) return;

  sidecar = spawn(
    pythonBin(),
    ["-m", "app.desktop"],
    {
      cwd: backendDir(),
      env: {
        ...process.env,
        LOCAL_MODE: "1",
        DEEPSEEK_API_KEY: key,
        DEFAULT_LLM_PROVIDER: "deepseek",
        DEFAULT_MODEL: "deepseek-chat",
        DESKTOP_EXECUTOR_URL: `http://127.0.0.1:${EXECUTOR_PORT}`,
        WORKSPACE_ROOT: workspaceRoot,
        SIDECAR_PORT: String(SIDECAR_PORT),
        CHECKPOINTER: "memory",
      },
    },
  );

  sidecar.stderr.on("data", (chunk) => {
    console.error("[sidecar]", chunk.toString());
  });
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  return win;
}

app.whenReady().then(() => {
  startExecutorServer(EXECUTOR_PORT);
  spawnSidecar();
  createWindow();

  ipcMain.handle("settings:getApiKey", () => (loadApiKey() ? "***configured***" : ""));
  ipcMain.handle("settings:setApiKey", (_e, key: string) => {
    saveApiKey(key.trim());
    spawnSidecar();
    return true;
  });
  ipcMain.handle("settings:clearApiKey", () => {
    clearApiKey();
    if (sidecar) sidecar.kill();
    sidecar = null;
    return true;
  });
  ipcMain.handle("workspace:get", () => workspaceRoot);
  ipcMain.handle("workspace:pick", async () => {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (result.canceled || !result.filePaths[0]) return workspaceRoot;
    workspaceRoot = result.filePaths[0];
    spawnSidecar();
    return workspaceRoot;
  });
  ipcMain.handle("sidecar:port", () => SIDECAR_PORT);
});

app.on("window-all-closed", () => {
  if (sidecar) sidecar.kill();
  if (process.platform !== "darwin") app.quit();
});
