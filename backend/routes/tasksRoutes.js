const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/tasksController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getTasks);
router.get('/:id', authenticateToken, getTask);
router.post('/', authenticateToken, authorize('admin', 'manager', 'employee'), createTask);
router.put('/:id', authenticateToken, authorize('admin', 'manager', 'employee'), updateTask);
router.delete('/:id', authenticateToken, authorize('admin', 'manager'), deleteTask);

module.exports = router;
