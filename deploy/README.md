# Agent Flow — Production Deployment

Kubernetes manifests and Helm values for the backend API. Static YAML under `k8s/` is the deploy source; `helm/values.yaml` documents tunables (replicas, resources, backup schedule).

## Prerequisites

- Kubernetes cluster (1.25+)
- Ingress controller (nginx recommended)
- Container registry with backend image built from `backend/Dockerfile`
- PostgreSQL 16 with pgvector (in-cluster, managed RDS, or Cloud SQL)

## Build and push image

```bash
docker build -t YOUR_REGISTRY/agent-flow/backend:TAG ./backend
docker push YOUR_REGISTRY/agent-flow/backend:TAG
```

Update `image:` in `k8s/backend-deployment.yaml` (or `helm/values.yaml` when templating).

## Secrets

Do **not** commit real secrets. Copy the example and fill values:

```bash
cp deploy/k8s/secrets.example.yaml deploy/k8s/secrets.yaml
# Edit DATABASE_URL, PGUSER, PGPASSWORD, OPENAI_API_KEY, JWT_SECRET, ADMIN_API_KEY
kubectl apply -f deploy/k8s/secrets.yaml
```

| Key | Required | Description |
|-----|----------|-------------|
| `DATABASE_URL` | yes | Postgres connection string |
| `PGUSER` / `PGPASSWORD` | yes (backup) | Used by postgres-backup CronJob |
| `OPENAI_API_KEY` | yes* | LLM provider key |
| `ANTHROPIC_API_KEY` | optional | When using Anthropic |
| `JWT_SECRET` | yes if `TENANT_MODE=true` | Signs tenant JWTs |
| `ADMIN_API_KEY` | recommended | Protects admin/audit routes |
| `LANGFUSE_*` | optional | Observability |

## Deploy

```bash
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/secrets.yaml          # after filling from example
kubectl apply -f deploy/k8s/backend-deployment.yaml
kubectl apply -f deploy/k8s/backend-service.yaml
kubectl apply -f deploy/k8s/ingress.yaml
kubectl apply -f deploy/k8s/postgres-backup-cronjob.yaml   # optional
```

Verify:

```bash
kubectl -n agent-flow get pods
kubectl -n agent-flow port-forward svc/agent-flow-backend 8000:80
curl http://localhost:8000/health
```

Set Ingress host in `k8s/ingress.yaml` to match your DNS (see `helm/values.yaml` `ingress.host`).

## Environment variables

Production settings are set in `backend-deployment.yaml` env block. Override by editing the manifest or using `kubectl set env`.

| Variable | Default (manifest) | Description |
|----------|-------------------|-------------|
| `CHECKPOINTER` | `postgres` | Use Postgres checkpoint (required in prod) |
| `TENANT_MODE` | `false` | Enable multi-tenant JWT auth and row isolation |
| `RATE_LIMIT_RPM` | `60` | Requests per minute per tenant; `0` disables |
| `SUPERVISOR_MODE` | `off` | `llm` enables planner routing |
| `DISPATCH_MODE` | `sequential` | `parallel` for fan-out subtasks |
| `CLIENT_EMBEDDING_MODE` | `true` | Client-side Ollama embeddings (768-dim) |
| `EXPECTED_EMBEDDING_DIMENSIONS` | `768` | pgvector column size |
| `LANGFUSE_ENABLED` | `false` | Langfuse tracing |

See repo root `.env.example` for the full list.

### Multi-tenant (`TENANT_MODE`)

When `TENANT_MODE=true`:

1. Set a strong `JWT_SECRET` in secrets.
2. Set `ADMIN_API_KEY` for admin endpoints.
3. Clients must send `Authorization: Bearer <jwt>`; rate limits apply per tenant.
4. Ensure Postgres migrations include tenant columns (Plan 07).

### Rate limiting

`RATE_LIMIT_RPM` is enforced by middleware per tenant (or global when tenant mode is off). Increase for high-traffic deployments or set `0` to disable (not recommended in production).

## Helm values

`helm/values.yaml` mirrors manifest defaults:

- `replicaCount: 2` — HA for API
- `resources` — CPU/memory requests and limits
- `postgresBackup.schedule` — CronJob schedule (`0 2 * * *` = daily 02:00 UTC)
- `postgresBackup.retentionDays` — local PVC retention (7 days)

Adjust values, then sync changes into `k8s/*.yaml` until full Helm templates are added.

## Postgres backup

The CronJob dumps `agentflow` to PVC `postgres-backup` using `pg_dump -Fc`. Restore:

```bash
kubectl -n agent-flow exec -it deploy/postgres-backup-debug -- pg_restore -d agentflow /backup/agentflow-YYYYMMDD-HHMMSS.dump
```

For managed Postgres, prefer provider-native backups; disable the CronJob with `postgresBackup.enabled: false` in values.

## SSE / long requests

Ingress annotations set 3600s proxy timeouts for `/v1/chat` SSE streams. Tune if sessions exceed one hour.

## Runbook

### Rollout

```bash
kubectl -n agent-flow set image deployment/agent-flow-backend api=YOUR_REGISTRY/agent-flow/backend:NEW_TAG
kubectl -n agent-flow rollout status deployment/agent-flow-backend
```

### Rollback

```bash
kubectl -n agent-flow rollout undo deployment/agent-flow-backend
```

### Logs

```bash
kubectl -n agent-flow logs -l app.kubernetes.io/name=agent-flow-backend -f --tail=100
```

### Scale

Edit `replicas` in `backend-deployment.yaml` or:

```bash
kubectl -n agent-flow scale deployment/agent-flow-backend --replicas=3
```

### Health check failing

1. Confirm `DATABASE_URL` and Postgres connectivity.
2. Check migrations applied (`backend/migrations/`).
3. `kubectl describe pod -n agent-flow -l app.kubernetes.io/name=agent-flow-backend`

### Enable observability

Set `LANGFUSE_ENABLED=true` and Langfuse keys in secrets; redeploy.
