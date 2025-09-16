export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  driverId?: string;
  status: OrderStatus;
  
  // Pickup details
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupContactName: string;
  pickupContactPhone: string;
  
  // Delivery details
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryContactName: string;
  deliveryContactPhone: string;
  
  // Package details
  packageType: string;
  packageWeight?: number;
  packageDimensions?: string;
  specialInstructions?: string;
  
  // Pricing and payment
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  
  // Timing
  scheduledPickupTime?: string;
  actualPickupTime?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  
  // Tracking
  estimatedDistance: number;
  estimatedDuration: number;
  
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  DRIVER_ASSIGNED = 'driver_assigned',
  DRIVER_EN_ROUTE_TO_PICKUP = 'driver_en_route_to_pickup',
  DRIVER_AT_PICKUP = 'driver_at_pickup',
  PACKAGE_PICKED_UP = 'package_picked_up',
  DRIVER_EN_ROUTE_TO_DELIVERY = 'driver_en_route_to_delivery',
  DRIVER_AT_DELIVERY = 'driver_at_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface OrderTracking {
  orderId: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  status: OrderStatus;
  statusHistory: OrderStatusUpdate[];
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}