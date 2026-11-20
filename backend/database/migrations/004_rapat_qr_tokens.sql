CREATE TABLE IF NOT EXISTS rapat_qr_tokens (
  id SERIAL PRIMARY KEY,
  rapat_id INTEGER NOT NULL REFERENCES rapat (id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rapat_qr_tokens_rapat ON rapat_qr_tokens (rapat_id);
CREATE INDEX IF NOT EXISTS idx_rapat_qr_tokens_expires ON rapat_qr_tokens (expires_at);
