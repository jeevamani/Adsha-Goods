# Database Setup Instructions

## Prerequisites
- PostgreSQL 12 or later installed and running
- Node.js 18 or later

## Setup Steps

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   
   # Start PostgreSQL service
   sudo systemctl start postgresql  # Linux
   brew services start postgresql   # macOS
   ```

2. **Create PostgreSQL User** (optional):
   ```bash
   sudo -u postgres createuser --interactive --pwprompt adsha_user
   ```

3. **Configure Environment Variables**:
   Copy the `.env.example` file from the backend directory and update the database configuration:
   ```bash
   cp ../backend/.env.example ../backend/.env
   ```
   
   Update the database settings in `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=adsha_goods
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

4. **Run Database Setup**:
   ```bash
   cd database
   npm install
   npm run setup
   ```

## Database Schema

The database includes the following main tables:

- **users**: All user accounts (customers, drivers, admins)
- **user_profiles**: Extended user profile information
- **drivers**: Driver-specific information and verification
- **orders**: All order information and tracking
- **order_tracking**: Real-time location tracking data
- **payments**: Payment processing and transaction records
- **driver_earnings**: Driver earnings and commission tracking
- **notifications**: Push notification logs
- **device_tokens**: FCM tokens for push notifications
- **app_settings**: Application configuration
- **pricing_config**: Dynamic pricing configuration
- **audit_logs**: Security and audit logging

## Default Data

The setup script creates:
- Default admin user: `admin@adshagoods.com` / `Admin@123`
- Default app settings
- Default pricing configuration for different vehicle types

## Available Scripts

- `npm run setup`: Create database and run initial schema
- `npm run migrate`: Run database migrations
- `npm run seed`: Seed database with test data
- `npm run reset`: Reset database (drops and recreates)

## Security Notes

- Change default admin password after first login
- Use environment-specific database credentials
- Enable SSL for production database connections
- Regularly backup the database

## Troubleshooting

### Connection Issues
1. Ensure PostgreSQL is running
2. Check firewall settings
3. Verify database credentials in .env file
4. Check PostgreSQL logs for errors

### Permission Issues
1. Ensure database user has CREATE privileges
2. Check PostgreSQL pg_hba.conf for authentication settings

### Extension Issues
If you get errors about extensions (uuid-ossp, postgis):
```bash
# Connect to your database as superuser
sudo -u postgres psql adsha_goods
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
```