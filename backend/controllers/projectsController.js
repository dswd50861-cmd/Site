const pool = require('../config/database');

// Get all projects
const getProjects = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT p.*,
             u.first_name as creator_first_name,
             u.last_name as creator_last_name,
             COUNT(DISTINCT t.id) as task_count,
             COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (status) {
      params.push(status);
      query += ` AND p.status = $${++paramCount}`;
    }

    query += ' GROUP BY p.id, u.first_name, u.last_name ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);

    res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      budget: parseFloat(row.budget || 0),
      createdBy: row.created_by,
      createdByName: row.creator_first_name ? `${row.creator_first_name} ${row.creator_last_name}` : null,
      taskCount: parseInt(row.task_count),
      completedTasks: parseInt(row.completed_tasks),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })));
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get single project
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*,
              u.first_name as creator_first_name,
              u.last_name as creator_last_name
       FROM projects p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      budget: parseFloat(row.budget || 0),
      createdBy: row.created_by,
      createdByName: row.creator_first_name ? `${row.creator_first_name} ${row.creator_last_name}` : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, budget } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const result = await pool.query(
      `INSERT INTO projects (name, description, status, start_date, end_date, budget, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, status || 'active', startDate, endDate, budget, req.user.id]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'created', 'project', result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, startDate, endDate, budget } = req.body;

    const result = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           budget = COALESCE($6, budget)
       WHERE id = $7
       RETURNING *`,
      [name, description, status, startDate, endDate, budget, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'updated', 'project', id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'deleted', 'project', id]
    );

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};
