const express = require('express');
const Joi = require('joi');
const Order = require('../models/Order');
const { ApiError } = require('../middleware/errorHandler');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create new order
const createOrderSchema = Joi.object({
  pickupAddress: Joi.string().required(),
  pickupLatitude: Joi.number().min(-90).max(90).required(),
  pickupLongitude: Joi.number().min(-180).max(180).required(),
  pickupContactName: Joi.string().min(2).max(100).required(),
  pickupContactPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  deliveryAddress: Joi.string().required(),
  deliveryLatitude: Joi.number().min(-90).max(90).required(),
  deliveryLongitude: Joi.number().min(-180).max(180).required(),
  deliveryContactName: Joi.string().min(2).max(100).required(),
  deliveryContactPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  packageType: Joi.string().required(),
  packageWeight: Joi.number().positive(),
  packageDimensions: Joi.string(),
  specialInstructions: Joi.string().max(500),
  paymentMethod: Joi.string().valid('cash', 'online', 'wallet').required(),
  scheduledPickupTime: Joi.date()
});

router.post('/', authorizeRoles('customer'), async (req, res, next) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0].message, 400);
    }

    // Calculate estimated distance and pricing (simplified)
    const estimatedDistance = calculateDistance(
      value.pickupLatitude, value.pickupLongitude,
      value.deliveryLatitude, value.deliveryLongitude
    );

    const estimatedDuration = Math.round(estimatedDistance * 3); // 3 minutes per km
    const basePrice = 50; // Base price
    const distancePrice = estimatedDistance * 12; // 12 per km
    const totalPrice = basePrice + distancePrice;

    const orderData = {
      ...value,
      customerId: req.user.id,
      orderNumber: await Order.generateOrderNumber(),
      estimatedDistance,
      estimatedDuration,
      basePrice,
      distancePrice,
      totalPrice,
      estimatedDeliveryTime: new Date(Date.now() + estimatedDuration * 60000)
    };

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });

  } catch (error) {
    next(error);
  }
});

// Get user's orders
router.get('/my-orders', async (req, res, next) => {
  try {
    const { status, startDate, endDate, limit = 20, offset = 0 } = req.query;
    
    const filters = {
      status,
      startDate,
      endDate,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    let orders;
    if (req.user.role === 'customer') {
      orders = await Order.getByCustomer(req.user.id, filters);
    } else if (req.user.role === 'driver') {
      orders = await Order.getByDriver(req.user.id, filters);
    } else {
      throw new ApiError('Unauthorized', 403);
    }

    res.json({
      success: true,
      data: { orders }
    });

  } catch (error) {
    next(error);
  }
});

// Get specific order
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    // Check if user has access to this order
    if (req.user.role === 'customer' && order.customer_id !== req.user.id) {
      throw new ApiError('Access denied', 403);
    }
    if (req.user.role === 'driver' && order.driver_id !== req.user.id) {
      throw new ApiError('Access denied', 403);
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    next(error);
  }
});

// Cancel order
router.put('/:id/cancel', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    // Check permissions
    if (req.user.role === 'customer' && order.customer_id !== req.user.id) {
      throw new ApiError('Access denied', 403);
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed', 'assigned'].includes(order.status)) {
      throw new ApiError('Order cannot be cancelled at this stage', 400);
    }

    const updatedOrder = await Order.updateStatus(req.params.id, 'cancelled');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order: updatedOrder }
    });

  } catch (error) {
    next(error);
  }
});

// Rate order (for customers and drivers)
const rateOrderSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  feedback: Joi.string().max(500)
});

router.post('/:id/rate', async (req, res, next) => {
  try {
    const { error, value } = rateOrderSchema.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0].message, 400);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    // Check permissions and order status
    if (order.status !== 'delivered') {
      throw new ApiError('Order must be delivered to rate', 400);
    }

    const { rating, feedback } = value;
    let updateData = {};

    if (req.user.role === 'customer' && order.customer_id === req.user.id) {
      updateData.customerRating = rating;
      updateData.customerFeedback = feedback;
    } else if (req.user.role === 'driver' && order.driver_id === req.user.id) {
      updateData.driverRating = rating;
      updateData.driverFeedback = feedback;
    } else {
      throw new ApiError('Access denied', 403);
    }

    const updatedOrder = await Order.updateRating(
      req.params.id,
      updateData.customerRating || order.customer_rating,
      updateData.customerFeedback || order.customer_feedback,
      updateData.driverRating || order.driver_rating,
      updateData.driverFeedback || order.driver_feedback
    );

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: { order: updatedOrder }
    });

  } catch (error) {
    next(error);
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router;