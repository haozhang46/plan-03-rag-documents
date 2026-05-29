ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS embedding_model TEXT,
  ADD COLUMN IF NOT EXISTS embedding_dimensions INT;

-- New installs: ensure 768-dim column (run only on fresh DB; see README for 1536→768 reset)
-- For greenfield, 001_documents.sql should use vector(768)
