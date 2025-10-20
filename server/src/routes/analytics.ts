import { Express, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authMiddleware } from '../middleware/auth';

export function registerAnalyticsRoutes(app: Express) {
  app.get('/api/analytics/overview', authMiddleware, async (_req: Request, res: Response) => {
    const [taskCounts, invoiceSums] = await Promise.all([
      pool.query(
        `select status, count(*)::int as count from tasks group by status`
      ),
      pool.query(
        `select status, sum(amount)::float as amount from invoices group by status`
      ),
    ]);

    const tasksByStatus = Object.fromEntries(taskCounts.rows.map(r => [r.status, r.count]));
    const invoiceAmountsByStatus = Object.fromEntries(invoiceSums.rows.map(r => [r.status, r.amount ?? 0]));

    res.json({ tasksByStatus, invoiceAmountsByStatus });
  });
}
