import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  formatTopologyContextForPrompt,
  resolveTopology,
  combineResourceAndTopologyContext,
} from "../../electron/resources/topology";

const sampleTopologyYaml = `version: 1
project: demo
nodes:
  - id: api
    kind: service
  - id: app-db
    kind: database
    engine: mysql
  - id: cache
    kind: cache
    engine: redis
edges:
  - from: api
    to: app-db
  - from: api
    to: cache
targets:
  - id: dev
    type: docker-compose
    env: dev
`;

describe("resolveTopology", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "af-topology-"));
    await fs.mkdir(path.join(tmp, ".agentflow"), { recursive: true });
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("prefers local topology.yaml over server", async () => {
    await fs.writeFile(path.join(tmp, ".agentflow/topology.yaml"), sampleTopologyYaml, "utf8");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ version: 1, project: "remote", nodes: [], edges: [], targets: [] }),
      }),
    );

    const topology = await resolveTopology(tmp, "http://resource-server:9000");
    expect(topology?.nodes[0].id).toBe("api");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("falls back to server when local file missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: 1,
          project: "demo",
          nodes: [{ id: "api", kind: "service" }],
          edges: [],
          targets: [],
        }),
      }),
    );

    const topology = await resolveTopology(tmp, "http://resource-server:9000", "demo");
    expect(fetch).toHaveBeenCalledWith("http://resource-server:9000/v1/topology?project=demo");
    expect(topology?.nodes[0].id).toBe("api");
  });
});

describe("formatTopologyContextForPrompt", () => {
  it("formats nodes, edges, and targets", () => {
    const markdown = formatTopologyContextForPrompt({
      version: 1,
      project: "demo",
      nodes: [
        { id: "api", kind: "service" },
        { id: "app-db", kind: "database", engine: "mysql" },
        { id: "cache", kind: "cache", engine: "redis" },
      ],
      edges: [
        { from: "api", to: "app-db" },
        { from: "api", to: "cache" },
      ],
      targets: [{ id: "dev", type: "docker-compose", env: "dev" }],
    });

    expect(markdown).toContain("## Service Topology");
    expect(markdown).toContain("app-db (mysql)");
    expect(markdown).toContain("targets: dev=docker-compose");
  });
});

describe("combineResourceAndTopologyContext", () => {
  it("joins resource and topology sections", () => {
    const combined = combineResourceAndTopologyContext(
      "## Available Server Resources\n- mysql/app-db: host=localhost",
      "## Service Topology\n- api → app-db (mysql)",
    );
    expect(combined).toContain("Available Server Resources");
    expect(combined).toContain("Service Topology");
  });
});
