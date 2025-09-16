const bcrypt = require('bcryptjs');
const db = require('../config/database');

class User {
  static async create(userData) {
    const { email, password, role, firstName, lastName, phone } = userData;
    const passwordHash = await bcrypt.hash(password, 12);

    const query = `
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, role, first_name, last_name, phone, is_active, is_verified, created_at
    `;

    const result = await db.query(query, [
      email, passwordHash, role, firstName, lastName, phone
    ]);

    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT u.*, up.* 
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateProfile(id, profileData) {
    const {
      firstName, lastName, phone, dateOfBirth, gender,
      address, city, state, postalCode, country,
      emergencyContactName, emergencyContactPhone
    } = profileData;

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Update users table
      const userQuery = `
        UPDATE users 
        SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `;
      const userResult = await client.query(userQuery, [firstName, lastName, phone, id]);

      // Update or create user profile
      const profileQuery = `
        INSERT INTO user_profiles (
          user_id, date_of_birth, gender, address, city, state, 
          postal_code, country, emergency_contact_name, emergency_contact_phone
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          date_of_birth = EXCLUDED.date_of_birth,
          gender = EXCLUDED.gender,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          postal_code = EXCLUDED.postal_code,
          country = EXCLUDED.country,
          emergency_contact_name = EXCLUDED.emergency_contact_name,
          emergency_contact_phone = EXCLUDED.emergency_contact_phone,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const profileResult = await client.query(profileQuery, [
        id, dateOfBirth, gender, address, city, state, 
        postalCode, country, emergencyContactName, emergencyContactPhone
      ]);

      await client.query('COMMIT');
      
      return {
        user: userResult.rows[0],
        profile: profileResult.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const query = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    await db.query(query, [passwordHash, id]);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateStatus(id, isActive) {
    const query = `
      UPDATE users 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [isActive, id]);
    return result.rows[0];
  }

  static async verify(id) {
    const query = `
      UPDATE users 
      SET is_verified = true, verification_token = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async setResetToken(email, token, expires) {
    const query = `
      UPDATE users 
      SET reset_token = $1, reset_token_expires = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE email = $3
      RETURNING *
    `;
    const result = await db.query(query, [token, expires, email]);
    return result.rows[0];
  }

  static async findByResetToken(token) {
    const query = `
      SELECT * FROM users 
      WHERE reset_token = $1 AND reset_token_expires > CURRENT_TIMESTAMP
    `;
    const result = await db.query(query, [token]);
    return result.rows[0];
  }

  static async clearResetToken(id) {
    const query = `
      UPDATE users 
      SET reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    await db.query(query, [id]);
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.phone, 
             u.is_active, u.is_verified, u.created_at,
             CASE WHEN u.role = 'driver' THEN d.is_available ELSE NULL END as is_available
      FROM users u
      LEFT JOIN drivers d ON u.id = d.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.role) {
      query += ` AND u.role = $${paramIndex}`;
      params.push(filters.role);
      paramIndex++;
    }

    if (filters.isActive !== undefined) {
      query += ` AND u.is_active = $${paramIndex}`;
      params.push(filters.isActive);
      paramIndex++;
    }

    if (filters.search) {
      query += ` AND (u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ` ORDER BY u.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = User;