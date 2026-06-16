import yaml from "yaml";
import type { ResourceConnection, ResourceDeclaration } from "./types";
import { ensureDockerCompose, getLocalConnections } from "./composeFallback";

export interface ResourceServerClient {
  provision(resources: ResourceDeclaration[]): Promise<ResourceConnection[]>;
}

export function createResourceServerClient(_url: string): ResourceServerClient {
  return {
    async provision(resources) {
      return resources.map((resource) => ({
        name: resource.name,
        type: resource.type,
        host: "resources.local",
        port: resource.type === "mysql" ? 3306 : resource.type === "redis" ? 6379 : 8080,
        dsn:
          resource.type === "mysql"
            ? `mysql://resources.local:3306/${resource.name}`
            : resource.type === "redis"
              ? "redis://resources.local:6379"
              : undefined,
      }));
    },
  };
}

function parseResourcesYaml(resourcesYaml: string): ResourceDeclaration[] {
  const parsed = yaml.parse(resourcesYaml) as
    | { resources?: ResourceDeclaration[] }
    | ResourceDeclaration[];
  if (Array.isArray(parsed)) {
    return parsed;
  }
  return parsed.resources ?? [];
}

export async function provision(
  projectRoot: string,
  resourcesYaml: string,
  resourceServerUrl?: string,
): Promise<ResourceConnection[]> {
  const resources = parseResourcesYaml(resourcesYaml);

  if (resourceServerUrl) {
    const client = createResourceServerClient(resourceServerUrl);
    return client.provision(resources);
  }

  await ensureDockerCompose(projectRoot, resources);
  return getLocalConnections(resources);
}
