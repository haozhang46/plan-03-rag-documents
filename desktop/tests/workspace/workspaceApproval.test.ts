import { describe, expect, it } from "vitest";
import { parsePendingWorkspaceApproval } from "../../src/workspace/workspaceApproval";
import { WORKSPACE_PENDING_PREFIX } from "../../shared/workspaceApprovalConstants";

describe("parsePendingWorkspaceApproval", () => {
  it("parses pending workspace payload", () => {
    const payload = {
      workflowId: "default-dev-cicd",
      stepId: "fe-dev",
      summary: "added: code",
      before: null,
      after: { version: 1, stepId: "fe-dev", layout: "tabs", components: [] },
    };
    const output = WORKSPACE_PENDING_PREFIX + JSON.stringify(payload);
    expect(parsePendingWorkspaceApproval(output)).toEqual(payload);
  });

  it("returns null for normal tool output", () => {
    expect(parsePendingWorkspaceApproval("Wrote AGENTS.md")).toBeNull();
  });
});
