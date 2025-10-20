const express = require('express');
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  recordPayment
} = require('../controllers/invoicesController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getInvoices);
router.get('/:id', authenticateToken, getInvoice);
router.post('/', authenticateToken, authorize('admin', 'manager', 'accountant'), createInvoice);
router.put('/:id', authenticateToken, authorize('admin', 'manager', 'accountant'), updateInvoice);
router.delete('/:id', authenticateToken, authorize('admin', 'manager'), deleteInvoice);
router.post('/:id/payments', authenticateToken, authorize('admin', 'manager', 'accountant'), recordPayment);

module.exports = router;
