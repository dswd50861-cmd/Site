const pool = require('../config/database');

// Get all tasks with filtering
const getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, projectId, customerId } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    let query = `
      SELECT 
        t.*, 
        p.name as project_name,
        c.contact_name as customer_name,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name,
        creator.first_name as creator_first_name,
        creator.last_name as creator_last_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users creator ON t.created_by = creator.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    // Employees can only see tasks assigned to them
    if (userRole === 'employee') {
      params.push(userId);
      query += ` AND t.assigned_to = $${++paramCount}`;
    }

    if (status) {
      params.push(status);
      query += ` AND t.status = $${++paramCount}`;
    }

    if (priority) {
      params.push(priority);
      query += ` AND t.priority = $${++paramCount}`;
    }

    if (assignedTo && userRole !== 'employee') {
      params.push(assignedTo);
      query += ` AND t.assigned_to = $${++paramCount}`;
    }

    if (projectId) {
      params.push(projectId);
      query += ` AND t.project_id = $${++paramCount}`;
    }

    if (customerId) {
      params.push(customerId);
      query += ` AND t.customer_id = $${++paramCount}`;
    }

    query += ' ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC';

    const result = await pool.query(query, params);

    res.json(result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date,
      completedAt: row.completed_at,
      projectId: row.project_id,
      projectName: row.project_name,
      customerId: row.customer_id,
      customerName: row.customer_name,
      assignedTo: row.assigned_to,
      assignedToName: row.assigned_first_name ? `${row.assigned_first_name} ${row.assigned_last_name}` : null,
      createdBy: row.created_by,
      createdByName: row.creator_first_name ? `${row.creator_first_name} ${row.creator_last_name}` : null,
      reminderSent: row.reminder_sent,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })));
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        t.*, 
        p.name as project_name,
        c.contact_name as customer_name,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN customers c ON t.customer_id = c.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date,
      completedAt: row.completed_at,
      projectId: row.project_id,
      projectName: row.project_name,
      customerId: row.customer_id,
      customerName: row.customer_name,
      assignedTo: row.assigned_to,
      assignedToName: row.assigned_first_name ? `${row.assigned_first_name} ${row.assigned_last_name}` : null,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assignedTo, customerId } = req.body;
    const createdBy = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, project_id, assigned_to, customer_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, status || 'pending', priority || 'medium', dueDate, projectId, assignedTo, customerId, createdBy]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [createdBy, 'created', 'task', result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, projectId, assignedTo, customerId } = req.body;

    const completedAt = status === 'completed' ? 'CURRENT_TIMESTAMP' : 'NULL';

    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date),
           project_id = COALESCE($6, project_id),
           assigned_to = COALESCE($7, assigned_to),
           customer_id = COALESCE($8, customer_id),
           completed_at = CASE WHEN $3 = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END
       WHERE id = $9
       RETURNING *`,
      [title, description, status, priority, dueDate, projectId, assignedTo, customerId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'updated', 'task', id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'deleted', 'task', id]
    );

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
