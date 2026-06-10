-- Per-tenant / per-user RAGFlow API key bindings

CREATE TABLE IF NOT EXISTS ragflow_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT '',
    api_key TEXT NOT NULL,
    default_dataset_ids TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ragflow_bindings_tenant
    ON ragflow_bindings (tenant_id);
