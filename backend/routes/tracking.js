const express = require('express');
const router = express.Router();

// Placeholder routes for tracking
router.get('/order/:id/location', (req, res) => {
  res.json({ success: true, data: { location: { lat: 12.9716, lng: 77.5946 } } });
});

router.post('/update-location', (req, res) => {
  res.json({ success: true, message: 'Location updated' });
});

module.exports = router;