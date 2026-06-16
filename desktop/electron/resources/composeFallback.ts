import fs from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";
import type { ResourceConnection, ResourceDeclaration } from "./types";

const DEFAULT_PORTS: Record<string, number> = {
  mysql: 3306,
  redis: 6379,
};

const DEFAULT_IMAGES: Record<string, string> = {
  mysql: "mysql:8",
  redis: "redis:7",
};

export function generateDockerCompose(resources: ResourceDeclaration[]): string {
  const services: Record<string, { image: string; ports: string[] }> = {};

  for (const resource of resources) {
    const image = DEFAULT_IMAGES[resource.type] ?? `${resource.type}:latest`;
    const port = DEFAULT_PORTS[resource.type] ?? 8080;
    services[resource.name] = {
      image,
      ports: [`${port}:${port}`],
    };
  }

  return yaml.stringify({ services });
}

export async function ensureDockerCompose(
  projectRoot: string,
  resources: ResourceDeclaration[],
): Promise<void> {
  const composePath = path.join(projectRoot, "docker-compose.yml");
  try {
    await fs.access(composePath);
  } catch {
    await fs.writeFile(composePath, generateDockerCompose(resources), "utf8");
  }
}

export function getLocalConnections(resources: ResourceDeclaration[]): ResourceConnection[] {
  return resources.map((resource) => {
    const port = DEFAULT_PORTS[resource.type] ?? 8080;
    const host = "127.0.0.1";
    const connection: ResourceConnection = {
      name: resource.name,
      type: resource.type,
      host,
      port,
    };

    if (resource.type === "mysql") {
      connection.dsn = `mysql://${host}:${port}/${resource.name}`;
    } else if (resource.type === "redis") {
      connection.dsn = `redis://${host}:${port}`;
    }

    return connection;
  });
}
