const crypto = require('crypto');

class OTPService {
  constructor() {
    this.otpStorage = new Map(); // In production, use Redis or database
    this.otpExpiry = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  /**
   * Generate a 6-digit OTP
   * @returns {string} 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP for a phone number
   * @param {string} phone - Phone number
   * @param {string} otp - Generated OTP
   */
  storeOTP(phone, otp) {
    const expiresAt = Date.now() + this.otpExpiry;
    this.otpStorage.set(phone, {
      otp,
      expiresAt,
      attempts: 0
    });
  }

  /**
   * Verify OTP for a phone number
   * @param {string} phone - Phone number
   * @param {string} otp - OTP to verify
   * @returns {boolean} True if OTP is valid
   */
  verifyOTP(phone, otp) {
    const stored = this.otpStorage.get(phone);
    
    if (!stored) {
      return false;
    }

    // Check if OTP has expired
    if (Date.now() > stored.expiresAt) {
      this.otpStorage.delete(phone);
      return false;
    }

    // Check if too many attempts
    if (stored.attempts >= 3) {
      this.otpStorage.delete(phone);
      return false;
    }

    // Increment attempts
    stored.attempts++;

    // Check if OTP matches
    if (stored.otp === otp) {
      this.otpStorage.delete(phone);
      return true;
    }

    return false;
  }

  /**
   * Clear OTP for a phone number
   * @param {string} phone - Phone number
   */
  clearOTP(phone) {
    this.otpStorage.delete(phone);
  }

  /**
   * Check if OTP exists and is not expired
   * @param {string} phone - Phone number
   * @returns {boolean} True if active OTP exists
   */
  hasActiveOTP(phone) {
    const stored = this.otpStorage.get(phone);
    if (!stored) {
      return false;
    }

    if (Date.now() > stored.expiresAt) {
      this.otpStorage.delete(phone);
      return false;
    }

    return true;
  }
}

// Simulate SMS sending (in production, integrate with SMS service)
const sendSMS = async (phone, message) => {
  console.log(`SMS to ${phone}: ${message}`);
  // In production, integrate with services like Twilio, AWS SNS, etc.
  return true;
};

module.exports = {
  OTPService,
  sendSMS
};