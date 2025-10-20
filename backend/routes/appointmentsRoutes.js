const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentsController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getAppointments);
router.get('/:id', authenticateToken, getAppointment);
router.post('/', authenticateToken, authorize('admin', 'manager', 'employee'), createAppointment);
router.put('/:id', authenticateToken, authorize('admin', 'manager', 'employee'), updateAppointment);
router.delete('/:id', authenticateToken, authorize('admin', 'manager'), deleteAppointment);

module.exports = router;
