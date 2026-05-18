-- Migracion: indices para prediccion de zonas de riesgo y alertas
CREATE INDEX idx_reportes_estado_created_at
  ON reportes (estado, created_at);

CREATE INDEX idx_reportes_tipo_created_at
  ON reportes (tipo_contaminacion, created_at);

CREATE INDEX idx_reportes_latitud_longitud
  ON reportes (latitud, longitud);
