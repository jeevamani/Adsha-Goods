const express = require('express');
const router = express.Router();

// Placeholder routes for payments
router.post('/create-payment-intent', (req, res) => {
  res.json({ success: true, data: { paymentIntent: 'pi_test_123' } });
});

router.post('/confirm-payment', (req, res) => {
  res.json({ success: true, message: 'Payment confirmed' });
});

module.exports = router;