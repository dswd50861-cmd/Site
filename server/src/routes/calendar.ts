import { Express, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authMiddleware } from '../middleware/auth';

export function registerCalendarRoutes(app: Express) {
  app.get('/api/calendar', authMiddleware, async (_req: Request, res: Response) => {
    const [tasks, invoices] = await Promise.all([
      pool.query(`select id, title, due_date as date, 'task' as type from tasks where due_date is not null`),
      pool.query(`select id, due_date as date, 'invoice' as type from invoices where due_date is not null`),
    ]);
    res.json({
      tasks: tasks.rows,
      invoices: invoices.rows,
    });
  });
}
