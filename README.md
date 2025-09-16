# Adsha Goods - Porter-like Platform

A comprehensive logistics platform with mobile apps for drivers and customers, and a web admin portal.

## Architecture Overview

- **Backend**: Node.js REST API with PostgreSQL database
- **Mobile Apps**: Angular/Ionic for iOS and Android
  - Driver App: For drivers to manage deliveries
  - Customer App: For customers to book and track orders
- **Admin Web Portal**: Angular web application for administrators

## Features

### Core Features
- Multi-role authentication (Driver, Customer, Admin)
- Real-time order booking and management
- Live GPS tracking
- Payment processing
- Push notifications
- Order history and analytics
- User profile management
- Admin dashboard and controls

### Security Features
- JWT-based authentication
- Role-based access control
- API rate limiting
- Data encryption
- Input validation and sanitization

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Angular CLI
- Ionic CLI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jeevamani/Adsha-Goods.git
cd Adsha-Goods
```

2. Install all dependencies:
```bash
npm run install-all
```

3. Set up the database:
```bash
cd database
npm run setup
```

4. Configure environment variables:
```bash
cp backend/.env.example backend/.env
# Edit .env with your database and API configurations
```

5. Start all services:
```bash
npm start
```

## Project Structure

```
├── backend/                 # Node.js API server
├── admin-web/              # Angular admin web portal
├── mobile-driver/          # Angular/Ionic driver mobile app
├── mobile-customer/        # Angular/Ionic customer mobile app
├── database/               # PostgreSQL schema and migrations
├── docs/                   # Documentation
└── README.md
```

## Available Scripts

- `npm run install-all` - Install dependencies for all modules
- `npm start` - Start all services concurrently
- `npm test` - Run tests for all modules
- `npm run build` - Build all modules for production

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/orders` - Get user's orders

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Manage users
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/analytics` - Analytics data

## Mobile Apps

### Driver App Features
- Login/Registration
- Order notifications
- Accept/Decline orders
- Navigation and GPS tracking
- Order status updates
- Earnings dashboard
- Profile management

### Customer App Features
- Login/Registration
- Book new deliveries
- Real-time tracking
- Payment processing
- Order history
- Rate and review
- Profile management

## Admin Portal Features
- User management
- Order management
- Analytics dashboard
- Payment management
- Settings and configuration
- Reports and exports

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Admin Web Development
```bash
cd admin-web
ng serve
```

### Mobile Development
```bash
cd mobile-driver
ionic serve

# In another terminal
cd mobile-customer
ionic serve
```

## Testing

Run tests for specific modules:
```bash
npm run test-backend
npm run test-admin
npm run test-mobile
```

## Deployment

### Backend Deployment
```bash
cd backend
npm run build
npm run start:prod
```

### Web Deployment
```bash
cd admin-web
ng build --prod
```

### Mobile Deployment
```bash
cd mobile-driver
ionic build
ionic capacitor build ios
ionic capacitor build android
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
