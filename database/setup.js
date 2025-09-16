const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../backend/.env' });

async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres' // Connect to default postgres database first
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'adsha_goods';
    try {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`Database ${dbName} already exists`);
      } else {
        throw error;
      }
    }

    await client.end();

    // Connect to the new database and run schema
    const appClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: dbName
    });

    await appClient.connect();
    console.log(`Connected to ${dbName} database`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await appClient.query(schema);
    console.log('Database schema created successfully');

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    
    const adminId = uuidv4();
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    
    await appClient.query(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active, is_verified)
      VALUES ($1, 'admin@adshagoods.com', $2, 'admin', 'System', 'Admin', '+919876543210', true, true)
      ON CONFLICT (email) DO NOTHING
    `, [adminId, adminPassword]);
    
    console.log('Default admin user created (admin@adshagoods.com / Admin@123)');

    await appClient.end();
    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;