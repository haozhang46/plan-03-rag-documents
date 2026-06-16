import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function resolveWorkspacePath(workspaceRoot: string, relPath: string): string {
  const root = path.resolve(workspaceRoot);
  const target = path.resolve(root, relPath || ".");
  if (!target.startsWith(root + path.sep) && target !== root) {
    throw new Error("path escapes workspace");
  }
  return target;
}

export async function readFileTool(workspaceRoot: string, relPath: string): Promise<string> {
  const target = resolveWorkspacePath(workspaceRoot, relPath);
  return fs.readFile(target, "utf8");
}

export async function listDirTool(workspaceRoot: string, relPath: string): Promise<string> {
  const target = resolveWorkspacePath(workspaceRoot, relPath || ".");
  const entries = await fs.readdir(target, { withFileTypes: true });
  return entries
    .map((e) => `${e.isDirectory() ? "d" : "f"}\t${e.name}`)
    .join("\n");
}

export async function gitStatus(workspaceRoot: string): Promise<string> {
  const { stdout } = await execFileAsync("git", ["status", "--short"], { cwd: workspaceRoot });
  return stdout || "(clean)";
}

export async function gitDiff(workspaceRoot: string, relPath: string): Promise<string> {
  const args = relPath ? ["diff", "--", relPath] : ["diff"];
  const { stdout } = await execFileAsync("git", args, { cwd: workspaceRoot });
  return stdout || "(no diff)";
}

const DANGEROUS = [/rm\s+-rf/i, /git\s+push\s+.*--force/i, /chmod\s+/i];

export function needsConfirm(command: string): boolean {
  return DANGEROUS.some((re) => re.test(command));
}

export async function runShell(
  workspaceRoot: string,
  command: string,
  confirm: (cmd: string) => Promise<boolean>,
): Promise<string> {
  if (needsConfirm(command)) {
    const ok = await confirm(command);
    if (!ok) throw new Error("user_denied");
  }
  const { stdout, stderr } = await execFileAsync("sh", ["-c", command], {
    cwd: workspaceRoot,
    maxBuffer: 1024 * 1024,
  });
  return [stdout, stderr].filter(Boolean).join("\n") || "(no output)";
}
