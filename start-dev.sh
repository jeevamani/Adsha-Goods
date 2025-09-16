#!/bin/bash

# Adsha Goods Porter Platform - Development Server Startup Script
# This script starts all services in development mode

echo "🚀 Starting Adsha Goods Porter Platform"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install admin web dependencies
echo "Installing admin web dependencies..."
cd admin-web
npm install
cd ..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check if .env file exists
if [ ! -f backend/.env ]; then
    echo "⚙️  Setting up environment configuration..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env with your database configuration before starting services"
    echo ""
fi

echo "🏃 Starting all services..."
echo ""
echo "Services will be available at:"
echo "  🌐 Admin Web Portal: http://localhost:4200"
echo "  🔧 Backend API:      http://localhost:5000"  
echo "  📱 Driver App:       http://localhost:8080"
echo "  📱 Customer App:     http://localhost:8081"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to kill all background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    jobs -p | xargs -r kill
    echo "✅ All services stopped"
    exit 0
}

# Set up cleanup trap
trap cleanup SIGINT SIGTERM

# Start backend server
echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start admin web portal  
echo "Starting admin web portal..."
cd admin-web
npm start &
ADMIN_PID=$!
cd ..

# Start driver app (simple HTTP server)
echo "Starting driver mobile app..."
cd mobile-driver
npx http-server -p 8080 -c-1 &
DRIVER_PID=$!
cd ..

# Start customer app (simple HTTP server)  
echo "Starting customer mobile app..."
cd mobile-customer
npx http-server -p 8081 -c-1 &
CUSTOMER_PID=$!
cd ..

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📋 Service Status:"
echo "  Backend API:      Running (PID: $BACKEND_PID)"
echo "  Admin Portal:     Running (PID: $ADMIN_PID)"
echo "  Driver App:       Running (PID: $DRIVER_PID)"
echo "  Customer App:     Running (PID: $CUSTOMER_PID)"
echo ""
echo "🔍 To test the services:"
echo "  1. Visit http://localhost:4200 for admin login"
echo "  2. Visit http://localhost:5000/health for API health check"
echo "  3. Visit http://localhost:8080 for driver app"
echo "  4. Visit http://localhost:8081 for customer app"
echo ""

# Wait for all background processes
wait