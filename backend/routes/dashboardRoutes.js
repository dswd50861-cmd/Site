const express = require('express');
const {
  getDashboardStats,
  getRecentActivity,
  getUpcomingDeadlines,
  getPaymentAnalytics
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticateToken, getDashboardStats);
router.get('/activity', authenticateToken, getRecentActivity);
router.get('/deadlines', authenticateToken, getUpcomingDeadlines);
router.get('/payment-analytics', authenticateToken, getPaymentAnalytics);

module.exports = router;
