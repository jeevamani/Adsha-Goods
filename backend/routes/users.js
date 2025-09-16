const express = require('express');
const Joi = require('joi');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          isActive: user.is_active,
          isVerified: user.is_verified,
          profile: {
            dateOfBirth: user.date_of_birth,
            gender: user.gender,
            address: user.address,
            city: user.city,
            state: user.state,
            postalCode: user.postal_code,
            country: user.country,
            emergencyContactName: user.emergency_contact_name,
            emergencyContactPhone: user.emergency_contact_phone
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
  dateOfBirth: Joi.date(),
  gender: Joi.string().valid('male', 'female', 'other'),
  address: Joi.string().max(500),
  city: Joi.string().max(100),
  state: Joi.string().max(100),
  postalCode: Joi.string().max(20),
  country: Joi.string().max(100),
  emergencyContactName: Joi.string().max(100),
  emergencyContactPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
});

router.put('/profile', async (req, res, next) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0].message, 400);
    }

    const result = await User.updateProfile(req.user.id, value);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: result.user, profile: result.profile }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;