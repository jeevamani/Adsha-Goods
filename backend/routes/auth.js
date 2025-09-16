const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const User = require('../models/User');
const { generateTokens, verifyRefreshToken, authenticateToken } = require('../middleware/auth');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number and one special character'
    }),
  role: Joi.string().valid('customer', 'driver').required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
});

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0].message, 400);
    }

    const { email, password, role, firstName, lastName, phone } = value;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ApiError('User already exists with this email', 409);
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      role,
      firstName,
      lastName,
      phone
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          isVerified: user.is_verified
        },
        tokens
      }
    });

  } catch (error) {
    next(error);
  }
});

// User login
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0].message, 400);
    }

    const { email, password } = value;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.is_active) {
      throw new ApiError('Account is inactive. Please contact support.', 401);
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          isVerified: user.is_verified
        },
        tokens
      }
    });

  } catch (error) {
    next(error);
  }
});

// Admin login (separate endpoint for additional security)
router.post('/admin/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0].message, 400);
    }

    const { email, password } = value;

    // Find admin user
    const user = await User.findByEmail(email);
    if (!user || user.role !== 'admin') {
      throw new ApiError('Invalid admin credentials', 401);
    }

    // Check if user is active
    if (!user.is_active) {
      throw new ApiError('Admin account is inactive', 401);
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError('Invalid admin credentials', 401);
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name
        },
        tokens
      }
    });

  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError('Refresh token required', 401);
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      throw new ApiError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: { tokens }
    });

  } catch (error) {
    next(error);
  }
});

// Forgot password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0].message, 400);
    }

    const { email } = value;

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal whether user exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await User.setResetToken(email, resetToken, resetTokenExpires);

    // In a real application, send email here
    // For now, we'll just return the token (remove this in production)
    res.json({
      success: true,
      message: 'Password reset token generated',
      data: {
        resetToken // Remove this in production
      }
    });

  } catch (error) {
    next(error);
  }
});

// Reset password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0].message, 400);
    }

    const { token, password } = value;

    const user = await User.findByResetToken(token);
    if (!user) {
      throw new ApiError('Invalid or expired reset token', 400);
    }

    // Update password
    await User.updatePassword(user.id, password);
    await User.clearResetToken(user.id);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Change password (authenticated)
router.post('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0].message, 400);
    }

    const { currentPassword, newPassword } = value;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await User.verifyPassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new ApiError('Current password is incorrect', 400);
    }

    // Update password
    await User.updatePassword(user.id, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Logout (client-side token invalidation)
router.post('/logout', authenticateToken, async (req, res) => {
  // In a stateless JWT system, logout is typically handled client-side
  // by removing the token from storage. In a more secure implementation,
  // you might maintain a blacklist of tokens or use short-lived tokens
  // with refresh token rotation.
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Verify token (useful for checking token validity)
router.get('/verify', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

module.exports = router;