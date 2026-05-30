ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS embedding_model TEXT,
  ADD COLUMN IF NOT EXISTS embedding_dimensions INT;

-- Adds document embedding metadata columns. Dimension change (1536→768) requires fresh DB volume reset.
-- For greenfield, 001_documents.sql should use vector(768)
