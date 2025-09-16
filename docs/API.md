# Adsha Goods Porter Platform - API Documentation

## Overview
This documentation covers the REST API endpoints for the Adsha Goods Porter-like logistics platform.

**Base URL**: `http://localhost:5000/api`

## Authentication

All API endpoints (except authentication endpoints) require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Authentication Endpoints

### POST /auth/register
Register a new user (customer or driver).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "role": "customer",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### POST /auth/login
Login for customers and drivers.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### POST /auth/admin/login
Separate login endpoint for administrators.

**Request Body:**
```json
{
  "email": "admin@adshagoods.com",
  "password": "Admin@123"
}
```

### POST /auth/refresh
Refresh expired access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### POST /auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
Reset password using token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "NewSecurePassword123!"
}
```

## User Management Endpoints

### GET /users/profile
Get current user's profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "profile": {
        "address": "123 Main St",
        "city": "New York",
        "state": "NY"
      }
    }
  }
}
```

### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "address": "456 Oak St",
  "city": "Boston",
  "state": "MA"
}
```

## Order Management Endpoints

### POST /orders
Create a new order (customers only).

**Request Body:**
```json
{
  "pickupAddress": "123 Main St, New York, NY",
  "pickupLatitude": 40.7128,
  "pickupLongitude": -74.0060,
  "pickupContactName": "John Doe",
  "pickupContactPhone": "+1234567890",
  "deliveryAddress": "456 Oak St, Boston, MA",
  "deliveryLatitude": 42.3601,
  "deliveryLongitude": -71.0589,
  "deliveryContactName": "Jane Smith",
  "deliveryContactPhone": "+0987654321",
  "packageType": "Documents",
  "packageWeight": 1.5,
  "paymentMethod": "online",
  "scheduledPickupTime": "2023-12-01T14:00:00Z"
}
```

### GET /orders/my-orders
Get orders for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by order status
- `startDate` (optional): Filter orders from this date
- `endDate` (optional): Filter orders until this date
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset

### GET /orders/:id
Get specific order details.

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "AG123456789",
      "status": "in_transit",
      "customerName": "John Doe",
      "driverName": "Mike Johnson",
      "pickupAddress": "123 Main St",
      "deliveryAddress": "456 Oak St",
      "totalPrice": 25.50,
      "createdAt": "2023-12-01T10:00:00Z"
    }
  }
}
```

### PUT /orders/:id/cancel
Cancel an order (customers only).

### POST /orders/:id/rate
Rate an order after completion.

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "Excellent service!"
}
```

## Driver Endpoints

### GET /drivers/available-orders
Get available orders for drivers.

### POST /drivers/accept-order
Accept an available order.

**Request Body:**
```json
{
  "orderId": "uuid"
}
```

### POST /drivers/location-update
Update driver's current location.

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "orderId": "uuid"
}
```

## Admin Endpoints

### GET /admin/dashboard
Get dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": {
        "totalOrders": 1000,
        "completedOrders": 850,
        "activeOrders": 50,
        "totalRevenue": 25000.00
      },
      "today": {
        "totalOrders": 25,
        "completedOrders": 20,
        "activeOrders": 5,
        "totalRevenue": 625.00
      }
    }
  }
}
```

### GET /admin/users
Get all users with filtering.

**Query Parameters:**
- `role`: Filter by user role (customer/driver/admin)
- `isActive`: Filter by active status
- `search`: Search by name or email
- `limit`: Number of results
- `offset`: Pagination offset

### PUT /admin/users/:id/status
Update user status (activate/deactivate).

**Request Body:**
```json
{
  "isActive": false
}
```

### GET /admin/orders
Get all orders with filtering.

**Query Parameters:**
- `status`: Filter by order status
- `customerId`: Filter by customer
- `driverId`: Filter by driver
- `startDate`: Date range start
- `endDate`: Date range end
- `search`: Search in order details

### PUT /admin/orders/:id/status
Update order status (admin override).

**Request Body:**
```json
{
  "status": "delivered"
}
```

## Payment Endpoints

### POST /payments/create-payment-intent
Create payment intent for order.

### POST /payments/confirm-payment
Confirm payment completion.

## Tracking Endpoints

### GET /tracking/order/:id/location
Get real-time location for order.

### POST /tracking/update-location
Update location during delivery.

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

## WebSocket Events

The platform uses Socket.IO for real-time features:

### Client Events (sent to server)
- `join` - Join user-specific room
- `location_update` - Driver location update
- `order_status_update` - Order status change

### Server Events (received from server)
- `driver_location` - Real-time driver location
- `order_update` - Order status updates
- `new_order` - New order notification (drivers)

### Example WebSocket Usage

```javascript
const socket = io('http://localhost:5000');

// Join user room
socket.emit('join', {
  userType: 'customer',
  userId: 'user-uuid'
});

// Listen for order updates
socket.on('order_update', (data) => {
  console.log('Order update:', data);
});
```

## Database Schema

### Key Tables
- `users` - All user accounts
- `user_profiles` - Extended user information
- `drivers` - Driver-specific data
- `orders` - Order information
- `order_tracking` - Location tracking data
- `payments` - Payment records
- `notifications` - Push notifications
- `app_settings` - Application configuration

## Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Role-based Access Control** - Different permissions for each role
3. **Rate Limiting** - Prevents API abuse
4. **Input Validation** - Joi schema validation
5. **SQL Injection Protection** - Parameterized queries
6. **CORS Configuration** - Cross-origin security
7. **Helmet.js** - Security headers

## Testing

Use tools like Postman or curl to test the API:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","role":"customer","firstName":"Test","lastName":"User","phone":"+1234567890"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```