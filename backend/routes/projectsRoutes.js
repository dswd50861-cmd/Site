const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectsController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getProjects);
router.get('/:id', authenticateToken, getProject);
router.post('/', authenticateToken, authorize('admin', 'manager'), createProject);
router.put('/:id', authenticateToken, authorize('admin', 'manager'), updateProject);
router.delete('/:id', authenticateToken, authorize('admin', 'manager'), deleteProject);

module.exports = router;
