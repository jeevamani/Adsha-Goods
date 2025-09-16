# Adsha Goods Porter Platform - Deployment Guide

## Production Deployment

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 12+ database server
- SSL certificates for HTTPS
- Domain name and DNS configuration
- PM2 or similar process manager

### Database Setup

1. **Create Production Database:**
```bash
sudo -u postgres createdb adsha_goods_prod
sudo -u postgres createuser adsha_user --pwprompt
```

2. **Set Database Permissions:**
```sql
GRANT ALL PRIVILEGES ON DATABASE adsha_goods_prod TO adsha_user;
```

3. **Run Database Setup:**
```bash
cd database
npm install
NODE_ENV=production npm run setup
```

### Backend Deployment

1. **Install Dependencies:**
```bash
cd backend
npm install --production
```

2. **Configure Environment:**
```bash
cp .env.example .env.production
```

Edit `.env.production`:
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_NAME=adsha_goods_prod
DB_USER=adsha_user
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secure-jwt-secret-256-bits
FRONTEND_URL=https://admin.adshagoods.com
```

3. **Start with PM2:**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Admin Web Portal Deployment

1. **Build for Production:**
```bash
cd admin-web
npm install
npm run build --prod
```

2. **Serve with Nginx:**
```nginx
server {
    listen 80;
    server_name admin.adshagoods.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.adshagoods.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    root /var/www/admin-web/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Mobile Apps Deployment

1. **Build for Android:**
```bash
cd mobile-driver
ionic build --prod
ionic capacitor build android --prod

cd ../mobile-customer
ionic build --prod
ionic capacitor build android --prod
```

2. **Build for iOS:**
```bash
ionic capacitor build ios --prod
```

### Environment Configuration

#### Production .env file:
```env
# Production Environment
NODE_ENV=production
PORT=5000

# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=adsha_goods_prod
DB_USER=adsha_user
DB_PASSWORD=your-secure-db-password

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-at-least-256-bits-long
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=7d

# API Keys
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@adshagoods.com
SMTP_PASS=your-app-password

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=https://admin.adshagoods.com
```

## Monitoring and Logging

### PM2 Ecosystem Configuration
Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'adsha-goods-backend',
    script: 'server.js',
    cwd: './backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};
```

### Log Rotation
```bash
# Install logrotate configuration
sudo tee /etc/logrotate.d/adsha-goods << EOF
/var/www/adsha-goods/logs/*.log {
  daily
  missingok
  rotate 14
  compress
  delaycompress
  notifempty
  create 0644 www-data www-data
  postrotate
    pm2 reload adsha-goods-backend
  endscript
}
EOF
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d admin.adshagoods.com
sudo certbot --nginx -d api.adshagoods.com
```

## Database Backup

### Automated Backup Script
```bash
#!/bin/bash
BACKUP_DIR="/backup/adsha-goods"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_NAME="adsha_goods_prod"

mkdir -p $BACKUP_DIR

pg_dump -U adsha_user -h localhost $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### Cron Job for Daily Backups
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (256+ bits)
- [ ] Enable SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up fail2ban for brute force protection
- [ ] Regular security updates
- [ ] Database connection encryption
- [ ] API rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Secure headers with Helmet.js

## Performance Optimization

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX CONCURRENTLY idx_orders_driver_status ON orders(driver_id, status);
CREATE INDEX CONCURRENTLY idx_order_tracking_created_at ON order_tracking(created_at);

-- Update table statistics
ANALYZE;
```

### Application Caching
```javascript
// Add Redis for session management and caching
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
```

## Monitoring

### Health Checks
```bash
# Add to monitoring system
curl -f http://localhost:5000/health || exit 1
```

### Prometheus Metrics (Optional)
```javascript
// Add to backend/server.js
const promClient = require('prom-client');
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues:**
   - Check PostgreSQL service status
   - Verify connection string and credentials
   - Check firewall rules

2. **JWT Token Issues:**
   - Ensure JWT secrets are properly set
   - Check token expiration settings
   - Verify clock synchronization

3. **File Upload Issues:**
   - Check directory permissions
   - Verify disk space
   - Check file size limits

4. **Socket.IO Connection Issues:**
   - Verify WebSocket support
   - Check proxy configuration
   - Confirm CORS settings

### Log Analysis
```bash
# View application logs
pm2 logs adsha-goods-backend

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Database logs
tail -f /var/log/postgresql/postgresql-*.log
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx/HAProxy)
- Database read replicas
- Redis cluster for sessions
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Database connection pooling
- PM2 cluster mode

### Microservices Migration
Consider splitting into:
- Authentication service
- Order management service  
- Notification service
- Payment service
- Analytics service