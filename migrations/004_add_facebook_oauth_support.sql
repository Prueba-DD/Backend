-- Migracion: Agregar soporte para Facebook OAuth
-- Descripcion: Agrega columna facebook_id a usuarios para vincular cuentas de Facebook.

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) UNIQUE NULL AFTER google_id;

CREATE INDEX IF NOT EXISTS idx_facebook_id ON usuarios(facebook_id);
