const db = require('../config/database');

class Order {
  static async create(orderData) {
    const {
      customerId, orderNumber, pickupAddress, pickupLatitude, pickupLongitude,
      pickupContactName, pickupContactPhone, deliveryAddress, deliveryLatitude,
      deliveryLongitude, deliveryContactName, deliveryContactPhone, packageType,
      packageWeight, packageDimensions, specialInstructions, estimatedDistance,
      estimatedDuration, basePrice, distancePrice, totalPrice, paymentMethod,
      scheduledPickupTime, estimatedDeliveryTime
    } = orderData;

    const query = `
      INSERT INTO orders (
        customer_id, order_number, pickup_address, pickup_latitude, pickup_longitude,
        pickup_contact_name, pickup_contact_phone, delivery_address, delivery_latitude,
        delivery_longitude, delivery_contact_name, delivery_contact_phone, package_type,
        package_weight, package_dimensions, special_instructions, estimated_distance,
        estimated_duration, base_price, distance_price, total_price, payment_method,
        scheduled_pickup_time, estimated_delivery_time, otp
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      ) RETURNING *
    `;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await db.query(query, [
      customerId, orderNumber, pickupAddress, pickupLatitude, pickupLongitude,
      pickupContactName, pickupContactPhone, deliveryAddress, deliveryLatitude,
      deliveryLongitude, deliveryContactName, deliveryContactPhone, packageType,
      packageWeight, packageDimensions, specialInstructions, estimatedDistance,
      estimatedDuration, basePrice, distancePrice, totalPrice, paymentMethod,
      scheduledPickupTime, estimatedDeliveryTime, otp
    ]);

    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT o.*, 
             uc.first_name as customer_first_name, uc.last_name as customer_last_name,
             uc.email as customer_email, uc.phone as customer_phone,
             ud.first_name as driver_first_name, ud.last_name as driver_last_name,
             ud.phone as driver_phone, d.vehicle_number, d.vehicle_type, d.rating as driver_rating
      FROM orders o
      LEFT JOIN users uc ON o.customer_id = uc.id
      LEFT JOIN users ud ON o.driver_id = ud.id
      LEFT JOIN drivers d ON o.driver_id = d.user_id
      WHERE o.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByOrderNumber(orderNumber) {
    const query = 'SELECT * FROM orders WHERE order_number = $1';
    const result = await db.query(query, [orderNumber]);
    return result.rows[0];
  }

  static async updateStatus(id, status, additionalData = {}) {
    let query = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP';
    const params = [status];
    let paramIndex = 2;

    if (additionalData.driverId) {
      query += `, driver_id = $${paramIndex}`;
      params.push(additionalData.driverId);
      paramIndex++;
    }

    if (additionalData.actualPickupTime) {
      query += `, actual_pickup_time = $${paramIndex}`;
      params.push(additionalData.actualPickupTime);
      paramIndex++;
    }

    if (additionalData.actualDeliveryTime) {
      query += `, actual_delivery_time = $${paramIndex}`;
      params.push(additionalData.actualDeliveryTime);
      paramIndex++;
    }

    query += ` WHERE id = $${paramIndex} RETURNING *`;
    params.push(id);

    const result = await db.query(query, params);
    return result.rows[0];
  }

  static async assignDriver(orderId, driverId) {
    const query = `
      UPDATE orders 
      SET driver_id = $1, status = 'assigned', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND status IN ('pending', 'confirmed')
      RETURNING *
    `;
    const result = await db.query(query, [driverId, orderId]);
    return result.rows[0];
  }

  static async getByCustomer(customerId, filters = {}) {
    let query = `
      SELECT o.*, 
             ud.first_name as driver_first_name, ud.last_name as driver_last_name,
             d.vehicle_number, d.vehicle_type
      FROM orders o
      LEFT JOIN users ud ON o.driver_id = ud.id
      LEFT JOIN drivers d ON o.driver_id = d.user_id
      WHERE o.customer_id = $1
    `;
    const params = [customerId];
    let paramIndex = 2;

    if (filters.status) {
      query += ` AND o.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.startDate) {
      query += ` AND o.created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND o.created_at <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    query += ` ORDER BY o.created_at DESC`;

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

  static async getByDriver(driverId, filters = {}) {
    let query = `
      SELECT o.*, 
             uc.first_name as customer_first_name, uc.last_name as customer_last_name,
             uc.phone as customer_phone
      FROM orders o
      LEFT JOIN users uc ON o.customer_id = uc.id
      WHERE o.driver_id = $1
    `;
    const params = [driverId];
    let paramIndex = 2;

    if (filters.status) {
      query += ` AND o.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.startDate) {
      query += ` AND o.created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND o.created_at <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    query += ` ORDER BY o.created_at DESC`;

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

  static async getPending(filters = {}) {
    let query = `
      SELECT o.*, 
             uc.first_name as customer_first_name, uc.last_name as customer_last_name,
             uc.phone as customer_phone
      FROM orders o
      JOIN users uc ON o.customer_id = uc.id
      WHERE o.status IN ('pending', 'confirmed')
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.vehicleType) {
      // This would require additional logic to match vehicle types with package requirements
    }

    if (filters.location) {
      // Add location-based filtering using PostGIS functions
      query += ` AND ST_DWithin(
        ST_GeogFromText('POINT(' || o.pickup_longitude || ' ' || o.pickup_latitude || ')'),
        ST_GeogFromText('POINT($${paramIndex} $${paramIndex + 1})'),
        $${paramIndex + 2}
      )`;
      params.push(filters.location.longitude, filters.location.latitude, filters.location.radius || 10000);
      paramIndex += 3;
    }

    query += ` ORDER BY o.created_at ASC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  static async updateRating(orderId, customerRating, customerFeedback, driverRating, driverFeedback) {
    const query = `
      UPDATE orders 
      SET customer_rating = $1, customer_feedback = $2, 
          driver_rating = $3, driver_feedback = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    const result = await db.query(query, [
      customerRating, customerFeedback, driverRating, driverFeedback, orderId
    ]);
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT o.*, 
             uc.first_name as customer_first_name, uc.last_name as customer_last_name,
             uc.email as customer_email, uc.phone as customer_phone,
             ud.first_name as driver_first_name, ud.last_name as driver_last_name,
             ud.phone as driver_phone, d.vehicle_number, d.vehicle_type
      FROM orders o
      LEFT JOIN users uc ON o.customer_id = uc.id
      LEFT JOIN users ud ON o.driver_id = ud.id
      LEFT JOIN drivers d ON o.driver_id = d.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND o.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.customerId) {
      query += ` AND o.customer_id = $${paramIndex}`;
      params.push(filters.customerId);
      paramIndex++;
    }

    if (filters.driverId) {
      query += ` AND o.driver_id = $${paramIndex}`;
      params.push(filters.driverId);
      paramIndex++;
    }

    if (filters.startDate) {
      query += ` AND o.created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND o.created_at <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters.search) {
      query += ` AND (o.order_number ILIKE $${paramIndex} OR o.pickup_address ILIKE $${paramIndex} OR o.delivery_address ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ` ORDER BY o.created_at DESC`;

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

  static async getStats(filters = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN status IN ('pending', 'confirmed', 'assigned', 'picked_up', 'in_transit') THEN 1 END) as active_orders,
        COALESCE(SUM(total_price), 0) as total_revenue,
        COALESCE(AVG(customer_rating), 0) as avg_customer_rating,
        COALESCE(AVG(driver_rating), 0) as avg_driver_rating
      FROM orders
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters.customerId) {
      query += ` AND customer_id = $${paramIndex}`;
      params.push(filters.customerId);
      paramIndex++;
    }

    if (filters.driverId) {
      query += ` AND driver_id = $${paramIndex}`;
      params.push(filters.driverId);
    }

    const result = await db.query(query, params);
    return result.rows[0];
  }

  static async generateOrderNumber() {
    const prefix = 'AG';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}

module.exports = Order;