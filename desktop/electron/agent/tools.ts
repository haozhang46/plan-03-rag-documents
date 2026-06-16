import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { runDesktopTool, type DesktopToolContext } from "../executor/runTool";

export function buildDesktopLangChainTools(ctx: DesktopToolContext) {
  return [
    tool(
      async ({ path }) => runDesktopTool(ctx, "read_file", { path }),
      {
        name: "read_file",
        description: "Read a UTF-8 text file relative to the workspace root.",
        schema: z.object({ path: z.string() }),
      },
    ),
    tool(
      async ({ path }) => runDesktopTool(ctx, "list_dir", { path }),
      {
        name: "list_dir",
        description: "List files and directories under a workspace-relative path.",
        schema: z.object({ path: z.string().default(".") }),
      },
    ),
    tool(
      async () => runDesktopTool(ctx, "git_status", {}),
      {
        name: "git_status",
        description: "Show git status for the workspace repository.",
        schema: z.object({}),
      },
    ),
    tool(
      async ({ path }) => runDesktopTool(ctx, "git_diff", { path }),
      {
        name: "git_diff",
        description: "Show git diff for the whole repo or a specific path.",
        schema: z.object({ path: z.string().default("") }),
      },
    ),
    tool(
      async ({ command }) => runDesktopTool(ctx, "run_shell", { command }),
      {
        name: "run_shell",
        description: "Run a shell command in the workspace directory.",
        schema: z.object({ command: z.string() }),
      },
    ),
  ];
}
