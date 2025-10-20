const pool = require('../config/database');

// Get all invoices
const getInvoices = async (req, res) => {
  try {
    const { status, customerId } = req.query;

    let query = `
      SELECT i.*, c.contact_name, c.company_name, c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (status) {
      params.push(status);
      query += ` AND i.status = $${++paramCount}`;
    }

    if (customerId) {
      params.push(customerId);
      query += ` AND i.customer_id = $${++paramCount}`;
    }

    query += ' ORDER BY i.created_at DESC';

    const result = await pool.query(query, params);

    res.json(result.rows.map(row => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      customerId: row.customer_id,
      customerName: row.contact_name,
      companyName: row.company_name,
      customerEmail: row.customer_email,
      projectId: row.project_id,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      amount: parseFloat(row.amount),
      tax: parseFloat(row.tax),
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      notes: row.notes,
      reminderSent: row.reminder_sent,
      lastReminderDate: row.last_reminder_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })));
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Get single invoice
const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT i.*, c.contact_name, c.company_name, c.email as customer_email,
              c.address, c.city, c.state, c.zip_code
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get payments for this invoice
    const payments = await pool.query(
      'SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC',
      [id]
    );

    const row = result.rows[0];
    res.json({
      id: row.id,
      invoiceNumber: row.invoice_number,
      customerId: row.customer_id,
      customer: {
        name: row.contact_name,
        company: row.company_name,
        email: row.customer_email,
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code
      },
      projectId: row.project_id,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      amount: parseFloat(row.amount),
      tax: parseFloat(row.tax),
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      notes: row.notes,
      reminderSent: row.reminder_sent,
      lastReminderDate: row.last_reminder_date,
      payments: payments.rows.map(p => ({
        id: p.id,
        amount: parseFloat(p.amount),
        paymentDate: p.payment_date,
        paymentMethod: p.payment_method,
        referenceNumber: p.reference_number,
        notes: p.notes
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

// Create new invoice
const createInvoice = async (req, res) => {
  try {
    const { customerId, projectId, issueDate, dueDate, amount, tax, notes } = req.body;

    if (!customerId || !issueDate || !dueDate || !amount) {
      return res.status(400).json({ error: 'Customer, dates, and amount are required' });
    }

    // Generate invoice number
    const numberResult = await pool.query(
      "SELECT COUNT(*) as count FROM invoices WHERE invoice_number LIKE 'INV-%'"
    );
    const invoiceNumber = `INV-${String(parseInt(numberResult.rows[0].count) + 1).padStart(5, '0')}`;

    const totalAmount = parseFloat(amount) + parseFloat(tax || 0);

    const result = await pool.query(
      `INSERT INTO invoices (invoice_number, customer_id, project_id, issue_date, due_date, amount, tax, total_amount, status, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10)
       RETURNING *`,
      [invoiceNumber, customerId, projectId, issueDate, dueDate, amount, tax || 0, totalAmount, notes, req.user.id]
    );

    // Update customer outstanding balance
    await pool.query(
      'UPDATE customers SET outstanding_balance = outstanding_balance + $1 WHERE id = $2',
      [totalAmount, customerId]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'created', 'invoice', result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, projectId, issueDate, dueDate, amount, tax, status, notes } = req.body;

    const totalAmount = amount && tax !== undefined ? parseFloat(amount) + parseFloat(tax) : null;

    const result = await pool.query(
      `UPDATE invoices
       SET customer_id = COALESCE($1, customer_id),
           project_id = COALESCE($2, project_id),
           issue_date = COALESCE($3, issue_date),
           due_date = COALESCE($4, due_date),
           amount = COALESCE($5, amount),
           tax = COALESCE($6, tax),
           total_amount = COALESCE($7, total_amount),
           status = COALESCE($8, status),
           notes = COALESCE($9, notes)
       WHERE id = $10
       RETURNING *`,
      [customerId, projectId, issueDate, dueDate, amount, tax, totalAmount, status, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'updated', 'invoice', id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);

    if (invoice.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Update customer outstanding balance
    await pool.query(
      'UPDATE customers SET outstanding_balance = outstanding_balance - $1 WHERE id = $2',
      [invoice.rows[0].total_amount, invoice.rows[0].customer_id]
    );

    await pool.query('DELETE FROM invoices WHERE id = $1', [id]);

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'deleted', 'invoice', id]
    );

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};

// Record payment for invoice
const recordPayment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { amount, paymentDate, paymentMethod, referenceNumber, notes } = req.body;

    if (!amount || !paymentDate || !paymentMethod) {
      return res.status(400).json({ error: 'Amount, payment date, and method are required' });
    }

    await client.query('BEGIN');

    // Get invoice details
    const invoice = await client.query('SELECT * FROM invoices WHERE id = $1', [id]);

    if (invoice.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Record payment
    const payment = await client.query(
      `INSERT INTO payments (invoice_id, amount, payment_date, payment_method, reference_number, notes, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, amount, paymentDate, paymentMethod, referenceNumber, notes, req.user.id]
    );

    // Get total payments for this invoice
    const totalPayments = await client.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE invoice_id = $1',
      [id]
    );

    const totalPaid = parseFloat(totalPayments.rows[0].total);
    const invoiceTotal = parseFloat(invoice.rows[0].total_amount);

    // Update invoice status
    const newStatus = totalPaid >= invoiceTotal ? 'paid' : 'pending';
    await client.query('UPDATE invoices SET status = $1 WHERE id = $2', [newStatus, id]);

    // Update customer balances
    await client.query(
      `UPDATE customers 
       SET outstanding_balance = outstanding_balance - $1,
           total_spent = total_spent + $1
       WHERE id = $2`,
      [amount, invoice.rows[0].customer_id]
    );

    await client.query('COMMIT');

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'payment_recorded', 'invoice', id]
    );

    res.status(201).json(payment.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Record payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  } finally {
    client.release();
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  recordPayment
};
