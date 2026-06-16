import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { generateDockerCompose, getLocalConnections } from "../../electron/resources/composeFallback";
import { provision } from "../../electron/resources/bridge";

const sampleResources = [
  { type: "mysql", name: "app-db", version: "8.0" },
  { type: "redis", name: "cache" },
];

const sampleYaml = `resources:
  - { type: mysql, name: app-db, version: "8.0" }
  - { type: redis, name: cache }
`;

describe("generateDockerCompose", () => {
  it("contains mysql and redis", () => {
    const compose = generateDockerCompose(sampleResources);
    expect(compose).toContain("mysql:8");
    expect(compose).toContain("redis:7");
    expect(compose).toContain("app-db");
    expect(compose).toContain("cache");
  });
});

describe("provision", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "af-res-"));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("without server url writes compose and returns connections", async () => {
    const connections = await provision(tmp, sampleYaml);
    const composeExists = await fs
      .access(path.join(tmp, "docker-compose.yml"))
      .then(() => true)
      .catch(() => false);
    expect(composeExists).toBe(true);
    expect(connections).toEqual(getLocalConnections(sampleResources));
  });

  it("with mock server url uses RPC stub", async () => {
    const connections = await provision(tmp, sampleYaml, "http://localhost:9999");
    const composeExists = await fs
      .access(path.join(tmp, "docker-compose.yml"))
      .then(() => true)
      .catch(() => false);
    expect(composeExists).toBe(false);
    expect(connections).toEqual([
      {
        name: "app-db",
        type: "mysql",
        host: "resources.local",
        port: 3306,
        dsn: "mysql://resources.local:3306/app-db",
      },
      {
        name: "cache",
        type: "redis",
        host: "resources.local",
        port: 6379,
        dsn: "redis://resources.local:6379",
      },
    ]);
  });
});
