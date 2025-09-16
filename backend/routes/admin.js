const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { ApiError } = require('../middleware/errorHandler');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(authorizeRoles('admin'));

// Dashboard statistics
router.get('/dashboard', async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { role, isActive, search, limit = 20, offset = 0 } = req.query;
    
    const filters = {
      role,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const users = await User.getAll(filters);

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
});

// Update user status
router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      throw new ApiError('isActive must be a boolean value', 400);
    }

    const user = await User.updateStatus(req.params.id, isActive);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Get all orders
router.get('/orders', async (req, res, next) => {
  try {
    const { status, customerId, driverId, startDate, endDate, search, limit = 20, offset = 0 } = req.query;
    
    const filters = {
      status,
      customerId,
      driverId,
      startDate,
      endDate,
      search,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const orders = await Order.getAll(filters);

    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
});

// Get order statistics
router.get('/orders/stats', async (req, res, next) => {
  try {
    const { startDate, endDate, customerId, driverId } = req.query;
    
    const filters = {
      startDate,
      endDate,
      customerId,
      driverId
    };

    const stats = await Order.getStats(filters);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

// Update order status (admin override)
router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ApiError('Invalid status', 400);
    }

    const order = await Order.updateStatus(req.params.id, status);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to get dashboard statistics
async function getDashboardStats() {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalStats,
    todayStats,
    weekStats,
    monthStats
  ] = await Promise.all([
    Order.getStats(),
    Order.getStats({ startDate: startOfToday }),
    Order.getStats({ startDate: startOfWeek }),
    Order.getStats({ startDate: startOfMonth })
  ]);

  return {
    total: totalStats,
    today: todayStats,
    thisWeek: weekStats,
    thisMonth: monthStats
  };
}

module.exports = router;