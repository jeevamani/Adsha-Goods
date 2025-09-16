# Adsha Goods - Modern Porter-like Platform

A comprehensive logistics platform with **elegant, modern mobile apps** for drivers and customers, featuring state-of-the-art UI/UX design with gradients, card layouts, smooth transitions, and micro-interactions.

![Customer App](https://github.com/user-attachments/assets/969f2251-b5dd-4ddf-be88-b472293e5ed0)

## 🚀 Features

### ✨ Modern UI/UX Design
- **Custom gradients** and premium color schemes
- **Card-based layouts** with smooth shadows and hover effects
- **Smooth animations** and micro-interactions
- **Responsive design** optimized for all device sizes (mobile-first)
- **Custom branding** elements with elegant typography

### 📱 Customer App (Orange Theme)
- **Welcome Screen** - Beautiful onboarding with floating animations
- **Authentication** - Modern sign-up/sign-in with form validation
- **Home Dashboard** - Personalized dashboard with quick actions and stats
- **Booking System** - Create and manage deliveries
- **Live Tracking** - Real-time GPS tracking with maps integration
- **Payment Integration** - Multiple payment options and history
- **Order History** - Detailed order tracking and receipts
- **Push Notifications** - Real-time updates and alerts
- **Profile Management** - User profile and preferences

![Customer Auth](https://github.com/user-attachments/assets/d42c0349-e5ae-4027-b770-9fa04c1bdc9f)

![Customer Dashboard](https://github.com/user-attachments/assets/e39da8d8-b11b-464a-9a47-686c3a4a75c0)

### 🚗 Driver App (Blue Theme)
- **Welcome Screen** - Driver-focused onboarding experience
- **Authentication** - Driver registration and verification
- **Job Dashboard** - Available orders and earnings overview
- **Order Management** - Accept/decline orders workflow
- **GPS Navigation** - Turn-by-turn navigation and route optimization
- **Earnings Tracking** - Real-time earnings and payment history
- **Real-time Notifications** - Job alerts and updates
- **Profile Management** - Driver profile and vehicle info

![Driver Welcome](https://github.com/user-attachments/assets/c373506d-9675-4f1c-bcde-fe7b8f7bc11b)

### 🖥️ Web Admin Portal
- **User Management** - Manage customers and drivers
- **Order Management** - Monitor and control all orders
- **Analytics Dashboard** - Business insights and reporting
- **Payment Management** - Transaction monitoring
- **Settings & Configuration** - Platform configuration

## 🏗️ Architecture Overview

- **Backend**: Node.js REST API with PostgreSQL database
- **Mobile Apps**: Angular 18 + Ionic 8 for iOS and Android
- **Admin Portal**: Angular web application
- **UI Framework**: Modern Ionic components with custom styling

## 📋 Requirements

- Node.js 20+
- Angular CLI 18+
- Ionic CLI 8+
- PostgreSQL 12+

## ⚡ Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/jeevamani/Adsha-Goods.git
cd Adsha-Goods

# Install global tools
npm install -g @angular/cli @ionic/cli

# Install all dependencies
npm run install-all
```

### 2. Database Setup
```bash
cd database
npm run setup
```

### 3. Environment Configuration
```bash
cp backend/.env.example backend/.env
# Edit .env with your database and API configurations
```

### 4. Start Development Servers

#### All Services (Recommended)
```bash
npm start
```

#### Individual Services
```bash
# Backend API (Port 5000)
npm run start-backend

# Customer App (Port 4201)
npm run start-mobile-customer

# Driver App (Port 4202)
npm run start-mobile-driver

# Admin Portal (Port 4200)
npm run start-admin
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
