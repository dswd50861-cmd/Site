import { pool } from './pool';

export async function initializeDatabase(): Promise<void> {
  // Create tables if they do not exist. Avoid DB-specific uuid defaults for compatibility with in-memory DB.
  await pool.query(`
    create table if not exists users (
      id uuid primary key,
      email text unique not null,
      password_hash text not null,
      role text not null check (role in ('admin','employee','accountant')),
      created_at timestamptz not null default now()
    );

    create table if not exists customers (
      id uuid primary key,
      name text not null,
      email text,
      phone text,
      company text,
      notes text,
      created_at timestamptz not null default now()
    );

    create table if not exists tasks (
      id uuid primary key,
      title text not null,
      description text,
      status text not null default 'pending',
      priority text not null default 'normal',
      due_date timestamptz,
      assigned_to uuid references users(id) on delete set null,
      customer_id uuid references customers(id) on delete set null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists invoices (
      id uuid primary key,
      customer_id uuid references customers(id) on delete set null,
      amount numeric(12,2) not null,
      status text not null check (status in ('unpaid','paid','overdue')) default 'unpaid',
      due_date timestamptz,
      issued_date timestamptz not null default now(),
      paid_date timestamptz
    );

    create table if not exists reminders (
      id uuid primary key,
      type text not null check (type in ('task_due','invoice_due','invoice_overdue')),
      ref_id uuid not null,
      scheduled_for timestamptz not null,
      sent_at timestamptz,
      channel text not null default 'internal',
      payload jsonb
    );

    -- helpful indexes
    create index if not exists idx_tasks_due on tasks(due_date);
    create index if not exists idx_invoices_due on invoices(due_date);
    create index if not exists idx_reminders_sched on reminders(scheduled_for) where sent_at is null;
  `);
}
