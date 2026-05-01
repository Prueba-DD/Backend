import pool from '../config/database.js';

export const EvidenciaModel = {
  
    // Trae todas las evidencias de un reporten 
   
  findByReporte: async (id_reporte) => {
    const [rows] = await pool.execute(
      `SELECT id_evidencia, uuid, id_usuario, tipo_archivo,
              url_archivo, nombre_original, mime_type, tamano_bytes,
              hash_sha256, verificado, orden, created_at
       FROM evidencias
       WHERE id_reporte = ?
       ORDER BY orden ASC, created_at ASC`,
      [id_reporte]
    );
    return rows;
  },

  
    // Registra una nueva evidencia asociada a un reporte
   
  create: async ({
    id_reporte,
    id_usuario,
    tipo_archivo,
    url_archivo,
    nombre_original,
    mime_type,
    tamano_bytes,
    hash_sha256 = null,
    orden = 0,
  }) => {
    const [result] = await pool.execute(
      `INSERT INTO evidencias
         (id_reporte, id_usuario, tipo_archivo, url_archivo, nombre_original,
          mime_type, tamano_bytes, hash_sha256, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_reporte, id_usuario, tipo_archivo, url_archivo, nombre_original,
        mime_type, tamano_bytes, hash_sha256, orden,
      ]
    );
    return result.insertId;
  },

};
