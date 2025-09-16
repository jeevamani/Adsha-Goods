const express = require('express');
const router = express.Router();

// Placeholder routes for drivers
router.get('/available-orders', (req, res) => {
  res.json({ success: true, data: { orders: [] } });
});

router.post('/accept-order', (req, res) => {
  res.json({ success: true, message: 'Order accepted' });
});

router.post('/location-update', (req, res) => {
  res.json({ success: true, message: 'Location updated' });
});

module.exports = router;