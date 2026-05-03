import pool from '../config/database.js';

export const RefreshTokenModel = {
  create: async ({
    id_usuario,
    token_hash,
    expires_at,
    user_agent = null,
    ip_address = null,
  }) => {
    const [result] = await pool.execute(
      `INSERT INTO refresh_tokens
         (id_usuario, token_hash, expires_at, user_agent, ip_address)
       VALUES (?, ?, ?, ?, ?)`,
      [id_usuario, token_hash, expires_at, user_agent, ip_address]
    );

    return result.insertId;
  },

  findActiveByHash: async (token_hash) => {
    const [rows] = await pool.execute(
      `SELECT rt.id_refresh_token, rt.id_usuario, rt.token_hash, rt.expires_at,
              u.uuid, u.nombre, u.apellido, u.email, u.rol, u.activo,
              u.email_verificado, u.avatar_url, u.telefono, u.created_at
       FROM refresh_tokens rt
       INNER JOIN usuarios u ON u.id_usuario = rt.id_usuario
       WHERE rt.token_hash = ?
         AND rt.revoked_at IS NULL
         AND rt.expires_at > NOW()
         AND u.deleted_at IS NULL
       LIMIT 1`,
      [token_hash]
    );

    return rows[0] ?? null;
  },

  revokeByHash: async (token_hash) => {
    const [result] = await pool.execute(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE token_hash = ? AND revoked_at IS NULL`,
      [token_hash]
    );

    return result.affectedRows > 0;
  },

  rotate: async ({
    current_hash,
    next_hash,
    expires_at,
    user_agent = null,
    ip_address = null,
  }) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [rows] = await connection.execute(
        `SELECT id_refresh_token, id_usuario
         FROM refresh_tokens
         WHERE token_hash = ?
           AND revoked_at IS NULL
           AND expires_at > NOW()
         LIMIT 1
         FOR UPDATE`,
        [current_hash]
      );

      const current = rows[0] ?? null;
      if (!current) {
        await connection.rollback();
        return null;
      }

      await connection.execute(
        `UPDATE refresh_tokens
         SET revoked_at = NOW()
         WHERE id_refresh_token = ?`,
        [current.id_refresh_token]
      );

      const [insertResult] = await connection.execute(
        `INSERT INTO refresh_tokens
           (id_usuario, token_hash, expires_at, user_agent, ip_address)
         VALUES (?, ?, ?, ?, ?)`,
        [current.id_usuario, next_hash, expires_at, user_agent, ip_address]
      );

      await connection.commit();
      return {
        id_usuario: current.id_usuario,
        id_refresh_token: insertResult.insertId,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  revokeAllForUser: async (id_usuario) => {
    const [result] = await pool.execute(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE id_usuario = ? AND revoked_at IS NULL`,
      [id_usuario]
    );

    return result.affectedRows;
  },
};

