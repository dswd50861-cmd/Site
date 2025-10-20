const pool = require('../config/database');

// Get all appointments
const getAppointments = async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;

    let query = `
      SELECT a.*, 
             c.contact_name as customer_name,
             p.name as project_name,
             json_agg(
               json_build_object(
                 'userId', u.id,
                 'firstName', u.first_name,
                 'lastName', u.last_name,
                 'email', u.email
               )
             ) FILTER (WHERE u.id IS NOT NULL) as attendees
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN projects p ON a.project_id = p.id
      LEFT JOIN appointment_attendees aa ON a.id = aa.appointment_id
      LEFT JOIN users u ON aa.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (startDate) {
      params.push(startDate);
      query += ` AND a.start_time >= $${++paramCount}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND a.end_time <= $${++paramCount}`;
    }

    if (customerId) {
      params.push(customerId);
      query += ` AND a.customer_id = $${++paramCount}`;
    }

    query += ' GROUP BY a.id, c.contact_name, p.name ORDER BY a.start_time ASC';

    const result = await pool.query(query, params);

    res.json(result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      location: row.location,
      customerId: row.customer_id,
      customerName: row.customer_name,
      projectId: row.project_id,
      projectName: row.project_name,
      attendees: row.attendees || [],
      reminderSent: row.reminder_sent,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })));
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Get single appointment
const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*, 
              c.contact_name as customer_name,
              p.name as project_name,
              json_agg(
                json_build_object(
                  'userId', u.id,
                  'firstName', u.first_name,
                  'lastName', u.last_name,
                  'email', u.email
                )
              ) FILTER (WHERE u.id IS NOT NULL) as attendees
       FROM appointments a
       LEFT JOIN customers c ON a.customer_id = c.id
       LEFT JOIN projects p ON a.project_id = p.id
       LEFT JOIN appointment_attendees aa ON a.id = aa.appointment_id
       LEFT JOIN users u ON aa.user_id = u.id
       WHERE a.id = $1
       GROUP BY a.id, c.contact_name, p.name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      location: row.location,
      customerId: row.customer_id,
      customerName: row.customer_name,
      projectId: row.project_id,
      projectName: row.project_name,
      attendees: row.attendees || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

// Create new appointment
const createAppointment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { title, description, startTime, endTime, location, customerId, projectId, attendeeIds } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ error: 'Title, start time, and end time are required' });
    }

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO appointments (title, description, start_time, end_time, location, customer_id, project_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, startTime, endTime, location, customerId, projectId, req.user.id]
    );

    const appointmentId = result.rows[0].id;

    // Add attendees
    if (attendeeIds && attendeeIds.length > 0) {
      const attendeeValues = attendeeIds.map(userId => `('${appointmentId}', '${userId}')`).join(',');
      await client.query(
        `INSERT INTO appointment_attendees (appointment_id, user_id) VALUES ${attendeeValues}`
      );
    }

    await client.query('COMMIT');

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'created', 'appointment', appointmentId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  } finally {
    client.release();
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, location, customerId, projectId, attendeeIds } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE appointments
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           location = COALESCE($5, location),
           customer_id = COALESCE($6, customer_id),
           project_id = COALESCE($7, project_id)
       WHERE id = $8
       RETURNING *`,
      [title, description, startTime, endTime, location, customerId, projectId, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update attendees if provided
    if (attendeeIds !== undefined) {
      await client.query('DELETE FROM appointment_attendees WHERE appointment_id = $1', [id]);

      if (attendeeIds.length > 0) {
        const attendeeValues = attendeeIds.map(userId => `('${id}', '${userId}')`).join(',');
        await client.query(
          `INSERT INTO appointment_attendees (appointment_id, user_id) VALUES ${attendeeValues}`
        );
      }
    }

    await client.query('COMMIT');

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'updated', 'appointment', id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  } finally {
    client.release();
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'deleted', 'appointment', id]
    );

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
