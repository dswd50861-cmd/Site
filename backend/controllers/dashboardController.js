const pool = require('../config/database');

// Get dashboard overview statistics
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Base queries that work for all roles
    const queries = {
      // Total active projects
      activeProjects: pool.query(
        "SELECT COUNT(*) as count FROM projects WHERE status = 'active'"
      ),
      
      // Tasks statistics
      taskStats: pool.query(
        `SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks,
          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
          COUNT(*) FILTER (WHERE due_date < CURRENT_TIMESTAMP AND status != 'completed') as overdue_tasks
         FROM tasks
         ${userRole === 'employee' ? 'WHERE assigned_to = $1' : ''}`
        ${userRole === 'employee' ? [userId] : []}
      ),
      
      // Invoice statistics
      invoiceStats: pool.query(
        `SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as pending_invoices,
          COUNT(*) FILTER (WHERE status = 'overdue') as overdue_invoices,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'pending'), 0) as pending_amount,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'overdue'), 0) as overdue_amount,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0) as paid_amount
         FROM invoices`
      ),
      
      // Recent payments
      recentPayments: pool.query(
        `SELECT SUM(amount) as total_recent_payments
         FROM payments
         WHERE payment_date >= CURRENT_DATE - INTERVAL '30 days'`
      ),
      
      // Customer count
      customerCount: pool.query(
        'SELECT COUNT(*) as count FROM customers'
      ),
      
      // Upcoming appointments
      upcomingAppointments: pool.query(
        `SELECT COUNT(*) as count
         FROM appointments
         WHERE start_time >= CURRENT_TIMESTAMP
         AND start_time <= CURRENT_TIMESTAMP + INTERVAL '7 days'`
      )
    };

    const results = await Promise.all([
      queries.activeProjects,
      queries.taskStats,
      queries.invoiceStats,
      queries.recentPayments,
      queries.customerCount,
      queries.upcomingAppointments
    ]);

    const stats = {
      activeProjects: parseInt(results[0].rows[0].count),
      tasks: {
        pending: parseInt(results[1].rows[0].pending_tasks),
        inProgress: parseInt(results[1].rows[0].in_progress_tasks),
        completed: parseInt(results[1].rows[0].completed_tasks),
        overdue: parseInt(results[1].rows[0].overdue_tasks)
      },
      invoices: {
        pending: parseInt(results[2].rows[0].pending_invoices),
        overdue: parseInt(results[2].rows[0].overdue_invoices),
        pendingAmount: parseFloat(results[2].rows[0].pending_amount),
        overdueAmount: parseFloat(results[2].rows[0].overdue_amount),
        paidAmount: parseFloat(results[2].rows[0].paid_amount)
      },
      recentPayments: parseFloat(results[3].rows[0].total_recent_payments || 0),
      totalCustomers: parseInt(results[4].rows[0].count),
      upcomingAppointments: parseInt(results[5].rows[0].count)
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const result = await pool.query(
      `SELECT 
        al.id, al.action, al.entity_type, al.entity_id, al.created_at,
        u.first_name, u.last_name, u.email
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows.map(row => ({
      id: row.id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      createdAt: row.created_at,
      user: row.first_name ? {
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email
      } : null
    })));
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

// Get upcoming tasks and deadlines
const getUpcomingDeadlines = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 10;

    const tasksQuery = userRole === 'employee'
      ? `SELECT 
          t.id, t.title, t.due_date, t.priority, t.status,
          p.name as project_name,
          c.contact_name as customer_name
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN customers c ON t.customer_id = c.id
         WHERE t.assigned_to = $1 AND t.status != 'completed'
         AND t.due_date IS NOT NULL
         ORDER BY t.due_date ASC
         LIMIT $2`
      : `SELECT 
          t.id, t.title, t.due_date, t.priority, t.status,
          p.name as project_name,
          c.contact_name as customer_name,
          u.first_name, u.last_name
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN customers c ON t.customer_id = c.id
         LEFT JOIN users u ON t.assigned_to = u.id
         WHERE t.status != 'completed'
         AND t.due_date IS NOT NULL
         ORDER BY t.due_date ASC
         LIMIT $1`;

    const params = userRole === 'employee' ? [userId, limit] : [limit];
    const result = await pool.query(tasksQuery, params);

    res.json(result.rows.map(row => ({
      id: row.id,
      title: row.title,
      dueDate: row.due_date,
      priority: row.priority,
      status: row.status,
      projectName: row.project_name,
      customerName: row.customer_name,
      ...(userRole !== 'employee' && row.first_name && {
        assignedTo: `${row.first_name} ${row.last_name}`
      })
    })));
  } catch (error) {
    console.error('Upcoming deadlines error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming deadlines' });
  }
};

// Get payment flow analytics
const getPaymentAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const result = await pool.query(
      `SELECT 
        DATE(payment_date) as date,
        SUM(amount) as total_amount,
        COUNT(*) as payment_count
       FROM payments
       WHERE payment_date >= CURRENT_DATE - $1::integer
       GROUP BY DATE(payment_date)
       ORDER BY date ASC`,
      [days]
    );

    res.json(result.rows.map(row => ({
      date: row.date,
      totalAmount: parseFloat(row.total_amount),
      paymentCount: parseInt(row.payment_count)
    })));
  } catch (error) {
    console.error('Payment analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch payment analytics' });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getUpcomingDeadlines,
  getPaymentAnalytics
};
