-- Migracion: Crear tabla de refresh tokens
-- Descripcion: Almacena refresh tokens hasheados para renovar access tokens e invalidar sesiones.

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id_refresh_token INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  user_agent VARCHAR(255) NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_refresh_tokens_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,

  INDEX idx_refresh_token_hash (token_hash),
  INDEX idx_refresh_usuario (id_usuario),
  INDEX idx_refresh_expires_at (expires_at),
  INDEX idx_refresh_revoked_at (revoked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
