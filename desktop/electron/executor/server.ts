import http from "node:http";
import { dialog } from "electron";
import {
  gitDiff,
  gitStatus,
  listDirTool,
  readFileTool,
  runShell,
} from "./tools";

export interface ToolRequest {
  call_id: string;
  name: string;
  args: Record<string, unknown>;
  workspace_root: string;
}

export function startExecutorServer(port = 17351): http.Server {
  const server = http.createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/v1/tool") {
      res.writeHead(404);
      res.end();
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body) as ToolRequest;
        const output = await handleTool(payload);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, output }));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: message }));
      }
    });
  });

  server.listen(port, "127.0.0.1");
  return server;
}

async function handleTool(req: ToolRequest): Promise<string> {
  const root = req.workspace_root;
  const args = req.args || {};

  switch (req.name) {
    case "read_file":
      return readFileTool(root, String(args.path || ""));
    case "list_dir":
      return listDirTool(root, String(args.path || "."));
    case "git_status":
      return gitStatus(root);
    case "git_diff":
      return gitDiff(root, String(args.path || ""));
    case "run_shell":
      return runShell(root, String(args.command || ""), async (cmd) => {
        const { response } = await dialog.showMessageBox({
          type: "warning",
          buttons: ["Allow", "Deny"],
          defaultId: 1,
          message: `Allow shell command?\n\n${cmd}`,
        });
        return response === 0;
      });
    default:
      throw new Error(`unknown tool: ${req.name}`);
  }
}
