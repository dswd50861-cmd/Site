const express = require('express');
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats
} = require('../controllers/customersController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getCustomers);
router.get('/:id', authenticateToken, getCustomer);
router.get('/:id/stats', authenticateToken, getCustomerStats);
router.post('/', authenticateToken, authorize('admin', 'manager', 'accountant'), createCustomer);
router.put('/:id', authenticateToken, authorize('admin', 'manager', 'accountant'), updateCustomer);
router.delete('/:id', authenticateToken, authorize('admin', 'manager'), deleteCustomer);

module.exports = router;
