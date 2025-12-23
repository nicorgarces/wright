-- RAC Documents table
-- Stores metadata for RAC regulation documents
CREATE TABLE IF NOT EXISTS rac_documents (
  id SERIAL PRIMARY KEY,
  rac_code VARCHAR(50) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  publication_date DATE,
  last_scraped TIMESTAMP DEFAULT NOW(),
  file_size_bytes INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_rac_documents_code ON rac_documents(rac_code);
CREATE INDEX IF NOT EXISTS idx_rac_documents_status ON rac_documents(status);
CREATE INDEX IF NOT EXISTS idx_rac_documents_last_scraped ON rac_documents(last_scraped);

-- Comments for documentation
COMMENT ON TABLE rac_documents IS 'Stores RAC (Reglamentos Aeronáuticos de Colombia) regulation documents metadata';
COMMENT ON COLUMN rac_documents.rac_code IS 'RAC regulation code (e.g., RAC 1, RAC 43)';
COMMENT ON COLUMN rac_documents.title IS 'Document title';
COMMENT ON COLUMN rac_documents.description IS 'Document description or summary';
COMMENT ON COLUMN rac_documents.pdf_url IS 'Original PDF download URL from Aerocivil website';
COMMENT ON COLUMN rac_documents.r2_key IS 'Object key in Cloudflare R2 bucket';
COMMENT ON COLUMN rac_documents.publication_date IS 'Official publication date of the regulation';
COMMENT ON COLUMN rac_documents.last_scraped IS 'Timestamp of last successful scrape';
COMMENT ON COLUMN rac_documents.file_size_bytes IS 'Size of the PDF file in bytes';
COMMENT ON COLUMN rac_documents.status IS 'Document status (active, archived, deprecated)';
