const express = require('express');
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const tasksRoutes = require('./tasksRoutes');
const customersRoutes = require('./customersRoutes');
const invoicesRoutes = require('./invoicesRoutes');
const appointmentsRoutes = require('./appointmentsRoutes');
const projectsRoutes = require('./projectsRoutes');
const usersRoutes = require('./usersRoutes');
const notificationsRoutes = require('./notificationsRoutes');

const router = express.Router();

// API health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Business Operations API is running' });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tasks', tasksRoutes);
router.use('/customers', customersRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/projects', projectsRoutes);
router.use('/users', usersRoutes);
router.use('/notifications', notificationsRoutes);

module.exports = router;
