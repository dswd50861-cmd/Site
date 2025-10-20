const pool = require('../config/database');

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;

    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (company_name ILIKE $1 OR contact_name ILIKE $1 OR email ILIKE $1)`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json(result.rows.map(row => ({
      id: row.id,
      companyName: row.company_name,
      contactName: row.contact_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      country: row.country,
      notes: row.notes,
      totalSpent: parseFloat(row.total_spent || 0),
      outstandingBalance: parseFloat(row.outstanding_balance || 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })));
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Get single customer
const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      companyName: row.company_name,
      contactName: row.contact_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      country: row.country,
      notes: row.notes,
      totalSpent: parseFloat(row.total_spent || 0),
      outstandingBalance: parseFloat(row.outstanding_balance || 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// Create new customer
const createCustomer = async (req, res) => {
  try {
    const { companyName, contactName, email, phone, address, city, state, zipCode, country, notes } = req.body;

    if (!contactName || !email) {
      return res.status(400).json({ error: 'Contact name and email are required' });
    }

    const result = await pool.query(
      `INSERT INTO customers (company_name, contact_name, email, phone, address, city, state, zip_code, country, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [companyName, contactName, email, phone, address, city, state, zipCode, country || 'USA', notes]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'created', 'customer', result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, contactName, email, phone, address, city, state, zipCode, country, notes } = req.body;

    const result = await pool.query(
      `UPDATE customers
       SET company_name = COALESCE($1, company_name),
           contact_name = COALESCE($2, contact_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           address = COALESCE($5, address),
           city = COALESCE($6, city),
           state = COALESCE($7, state),
           zip_code = COALESCE($8, zip_code),
           country = COALESCE($9, country),
           notes = COALESCE($10, notes)
       WHERE id = $11
       RETURNING *`,
      [companyName, contactName, email, phone, address, city, state, zipCode, country, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'updated', 'customer', id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'deleted', 'customer', id]
    );

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// Get customer statistics
const getCustomerStats = async (req, res) => {
  try {
    const { id } = req.params;

    const [invoices, payments, tasks, projects] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) as count, 
                COALESCE(SUM(total_amount), 0) as total
         FROM invoices WHERE customer_id = $1`,
        [id]
      ),
      pool.query(
        `SELECT COUNT(*) as count,
                COALESCE(SUM(p.amount), 0) as total
         FROM payments p
         JOIN invoices i ON p.invoice_id = i.id
         WHERE i.customer_id = $1`,
        [id]
      ),
      pool.query(
        'SELECT COUNT(*) as count FROM tasks WHERE customer_id = $1',
        [id]
      ),
      pool.query(
        `SELECT COUNT(DISTINCT p.id) as count
         FROM projects p
         JOIN tasks t ON t.project_id = p.id
         WHERE t.customer_id = $1`,
        [id]
      )
    ]);

    res.json({
      invoices: {
        count: parseInt(invoices.rows[0].count),
        total: parseFloat(invoices.rows[0].total)
      },
      payments: {
        count: parseInt(payments.rows[0].count),
        total: parseFloat(payments.rows[0].total)
      },
      tasks: parseInt(tasks.rows[0].count),
      projects: parseInt(projects.rows[0].count)
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ error: 'Failed to fetch customer statistics' });
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats
};
