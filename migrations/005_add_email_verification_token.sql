-- Migracion: Agregar token de verificacion de correo
-- Descripcion: Permite verificar cuentas por enlace seguro enviado por email.

ALTER TABLE usuarios
ADD COLUMN email_verification_token VARCHAR(64) NULL DEFAULT NULL COMMENT 'Hash SHA-256 del token de verificacion de correo',
ADD COLUMN email_verification_exp DATETIME NULL DEFAULT NULL COMMENT 'Fecha de expiracion del token de verificacion de correo';

CREATE INDEX idx_email_verification_token ON usuarios(email_verification_token);
CREATE INDEX idx_email_verification_exp ON usuarios(email_verification_exp);

