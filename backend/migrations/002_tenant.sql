-- Multi-tenant columns and row-level security (Plan 07 Task 3)

ALTER TABLE documents ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default';

CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents (tenant_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_tenant ON document_chunks (tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant ON sessions (tenant_id);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_documents ON documents;
CREATE POLICY tenant_isolation_documents ON documents
    USING (tenant_id = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS tenant_isolation_document_chunks ON document_chunks;
CREATE POLICY tenant_isolation_document_chunks ON document_chunks
    USING (tenant_id = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS tenant_isolation_sessions ON sessions;
CREATE POLICY tenant_isolation_sessions ON sessions
    USING (tenant_id = current_setting('app.tenant_id', true));
