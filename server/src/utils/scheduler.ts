import cron from 'node-cron';
import { pool } from '../db/pool';
import { addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export function scheduleReminders() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    await createInvoiceDueReminders();
    await createTaskDueReminders();
  });
}

async function createInvoiceDueReminders() {
  const soon = addDays(new Date(), 3);
  const candidates = await pool.query(
    `select id, amount, due_date from invoices where status = 'unpaid' and due_date is not null and due_date <= $1`,
    [soon]
  );

  for (const row of candidates.rows as Array<{ id: string; amount: number; due_date: string }>) {
    // avoid duplicates by checking existing reminder
    const existing = await pool.query(
      `select 1 from reminders where type = 'invoice_due' and ref_id = $1 and scheduled_for = $2 limit 1`,
      [row.id, row.due_date]
    );
    if (existing.rowCount > 0) continue;
    await pool.query(
      `insert into reminders (id, type, ref_id, scheduled_for, channel, payload)
       values ($1, $2, $3, $4, $5, $6::jsonb)`,
      [uuidv4(), 'invoice_due', row.id, row.due_date, 'internal', JSON.stringify({ amount: row.amount })]
    );
  }

  // mark overdue invoices
  await pool.query(`update invoices set status = 'overdue' where status = 'unpaid' and due_date < now()`);
}

async function createTaskDueReminders() {
  const soon = addDays(new Date(), 2);
  const candidates = await pool.query(
    `select id, title, due_date from tasks where due_date is not null and due_date <= $1`,
    [soon]
  );
  for (const row of candidates.rows as Array<{ id: string; title: string; due_date: string }>) {
    const existing = await pool.query(
      `select 1 from reminders where type = 'task_due' and ref_id = $1 and scheduled_for = $2 limit 1`,
      [row.id, row.due_date]
    );
    if (existing.rowCount > 0) continue;
    await pool.query(
      `insert into reminders (id, type, ref_id, scheduled_for, channel, payload)
       values ($1, $2, $3, $4, $5, $6::jsonb)`,
      [uuidv4(), 'task_due', row.id, row.due_date, 'internal', JSON.stringify({ title: row.title })]
    );
  }
}
