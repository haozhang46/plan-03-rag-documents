# AgentFlow Resource Server

Deployment-agnostic topology + instances gateway for Agent Flow Desktop.

## Run

```bash
cd resource-server
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 9000
```

Or from repo root:

```bash
pnpm dev:resource-server
```

## API (v1)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/v1/resources/config?project=<id>` | Connection instances |
| GET | `/v1/topology?project=<id>` | Topology graph |
| PUT | `/v1/topology?project=<id>` | Save topology |
| GET | `/v1/topology/markdown?project=<id>` | LLM-ready summary |
| GET | `/v1/deployment/summary?project=<id>` | Platform + services |
| POST | `/v1/topology/import?project=<id>` | Import compose YAML |
| POST | `/v1/topology/export?project=<id>` | Export compose YAML |

Web UI: `http://localhost:9000/ui/`

## Desktop integration

Set **Settings → Resource Server URL** to `http://localhost:9000`. Desktop fetches topology for `cicd` / `be-dev` / `test` steps and shows it in WorkflowCicdPanel.

## Tests

```bash
cd resource-server && pytest -v
```
