const cron = require('node-cron');
const pool = require('../config/database');
const nodemailer = require('nodemailer');

// Email transporter setup (optional - requires email configuration)
let transporter = null;

if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// Create notification in database
const createNotification = async (userId, type, title, message, relatedEntityType, relatedEntityId) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, type, title, message, relatedEntityType, relatedEntityId]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Send email notification (if configured)
const sendEmail = async (to, subject, text) => {
  if (!transporter) {
    console.log('Email not configured, skipping email to:', to);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log('Email sent to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Check for overdue tasks and send reminders
const checkOverdueTasks = async () => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.email, u.first_name, u.last_name
       FROM tasks t
       JOIN users u ON t.assigned_to = u.id
       WHERE t.status NOT IN ('completed', 'cancelled')
       AND t.due_date < CURRENT_TIMESTAMP
       AND (t.reminder_sent = false OR t.reminder_sent IS NULL)
       AND t.assigned_to IS NOT NULL`
    );

    for (const task of result.rows) {
      const message = `Task "${task.title}" is overdue. Due date was ${new Date(task.due_date).toLocaleDateString()}.`;
      
      // Create in-app notification
      await createNotification(
        task.assigned_to,
        'task_due',
        'Overdue Task',
        message,
        'task',
        task.id
      );

      // Send email notification
      await sendEmail(
        task.email,
        'Overdue Task Reminder',
        `Hi ${task.first_name},\n\n${message}\n\nPlease complete this task as soon as possible.`
      );

      // Mark reminder as sent
      await pool.query('UPDATE tasks SET reminder_sent = true WHERE id = $1', [task.id]);
    }

    console.log(`Checked overdue tasks: ${result.rows.length} reminders sent`);
  } catch (error) {
    console.error('Error checking overdue tasks:', error);
  }
};

// Check for upcoming task deadlines (24 hours before)
const checkUpcomingTaskDeadlines = async () => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.email, u.first_name, u.last_name
       FROM tasks t
       JOIN users u ON t.assigned_to = u.id
       WHERE t.status NOT IN ('completed', 'cancelled')
       AND t.due_date > CURRENT_TIMESTAMP
       AND t.due_date <= CURRENT_TIMESTAMP + INTERVAL '24 hours'
       AND (t.reminder_sent = false OR t.reminder_sent IS NULL)
       AND t.assigned_to IS NOT NULL`
    );

    for (const task of result.rows) {
      const message = `Task "${task.title}" is due within 24 hours. Due date: ${new Date(task.due_date).toLocaleString()}.`;
      
      await createNotification(
        task.assigned_to,
        'task_due',
        'Upcoming Task Deadline',
        message,
        'task',
        task.id
      );

      await sendEmail(
        task.email,
        'Task Deadline Reminder',
        `Hi ${task.first_name},\n\n${message}\n\nPlease ensure you complete this task on time.`
      );

      await pool.query('UPDATE tasks SET reminder_sent = true WHERE id = $1', [task.id]);
    }

    console.log(`Checked upcoming task deadlines: ${result.rows.length} reminders sent`);
  } catch (error) {
    console.error('Error checking upcoming task deadlines:', error);
  }
};

// Check for overdue invoices
const checkOverdueInvoices = async () => {
  try {
    // Update invoice status to overdue
    await pool.query(
      `UPDATE invoices
       SET status = 'overdue'
       WHERE status = 'pending'
       AND due_date < CURRENT_DATE`
    );

    // Get overdue invoices that need reminders
    const result = await pool.query(
      `SELECT i.*, c.contact_name, c.email, c.company_name
       FROM invoices i
       JOIN customers c ON i.customer_id = c.id
       WHERE i.status = 'overdue'
       AND (i.last_reminder_date IS NULL OR i.last_reminder_date < CURRENT_DATE - INTERVAL '7 days')`
    );

    for (const invoice of result.rows) {
      const message = `Invoice ${invoice.invoice_number} for ${invoice.company_name || invoice.contact_name} is overdue. Amount: $${invoice.total_amount}`;
      
      // Notify all admins and accountants
      const adminResult = await pool.query(
        "SELECT id FROM users WHERE role IN ('admin', 'accountant', 'manager') AND is_active = true"
      );

      for (const admin of adminResult.rows) {
        await createNotification(
          admin.id,
          'invoice_due',
          'Overdue Invoice',
          message,
          'invoice',
          invoice.id
        );
      }

      // Send email to customer
      await sendEmail(
        invoice.email,
        'Payment Reminder - Overdue Invoice',
        `Dear ${invoice.contact_name},\n\nThis is a reminder that Invoice ${invoice.invoice_number} is now overdue.\n\nAmount Due: $${invoice.total_amount}\nDue Date: ${new Date(invoice.due_date).toLocaleDateString()}\n\nPlease submit your payment as soon as possible.`
      );

      // Update last reminder date
      await pool.query(
        'UPDATE invoices SET last_reminder_date = CURRENT_TIMESTAMP WHERE id = $1',
        [invoice.id]
      );
    }

    console.log(`Checked overdue invoices: ${result.rows.length} reminders sent`);
  } catch (error) {
    console.error('Error checking overdue invoices:', error);
  }
};

// Check for upcoming appointments (24 hours before)
const checkUpcomingAppointments = async () => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
              json_agg(json_build_object('id', u.id, 'email', u.email, 'firstName', u.first_name)) as attendees
       FROM appointments a
       JOIN appointment_attendees aa ON a.id = aa.appointment_id
       JOIN users u ON aa.user_id = u.id
       WHERE a.start_time > CURRENT_TIMESTAMP
       AND a.start_time <= CURRENT_TIMESTAMP + INTERVAL '24 hours'
       AND (a.reminder_sent = false OR a.reminder_sent IS NULL)
       GROUP BY a.id`
    );

    for (const appointment of result.rows) {
      const message = `Upcoming appointment: "${appointment.title}" at ${new Date(appointment.start_time).toLocaleString()}`;
      
      for (const attendee of appointment.attendees) {
        await createNotification(
          attendee.id,
          'appointment',
          'Appointment Reminder',
          message,
          'appointment',
          appointment.id
        );

        await sendEmail(
          attendee.email,
          'Appointment Reminder',
          `Hi ${attendee.firstName},\n\n${message}\n\nLocation: ${appointment.location || 'TBD'}\n\nDescription: ${appointment.description || 'N/A'}`
        );
      }

      await pool.query('UPDATE appointments SET reminder_sent = true WHERE id = $1', [appointment.id]);
    }

    console.log(`Checked upcoming appointments: ${result.rows.length} reminders sent`);
  } catch (error) {
    console.error('Error checking upcoming appointments:', error);
  }
};

// Initialize cron jobs
const initializeReminderService = () => {
  console.log('🔔 Initializing reminder service...');

  // Check for overdue tasks every hour
  cron.schedule('0 * * * *', () => {
    console.log('Running overdue tasks check...');
    checkOverdueTasks();
  });

  // Check for upcoming task deadlines every 6 hours
  cron.schedule('0 */6 * * *', () => {
    console.log('Running upcoming task deadlines check...');
    checkUpcomingTaskDeadlines();
  });

  // Check for overdue invoices daily at 9 AM
  cron.schedule('0 9 * * *', () => {
    console.log('Running overdue invoices check...');
    checkOverdueInvoices();
  });

  // Check for upcoming appointments every 6 hours
  cron.schedule('0 */6 * * *', () => {
    console.log('Running upcoming appointments check...');
    checkUpcomingAppointments();
  });

  console.log('✅ Reminder service initialized successfully');
};

module.exports = { initializeReminderService };
